from uuid import uuid4

from tests.helpers import account, bearer
from tests.test_chat import PREFS, connect


async def test_notifications_are_private_generic_and_obey_preferences(client):
    first = await account(client, "notify-sender", **PREFS)
    second = await account(client, "notify-recipient", **PREFS)
    conversation = await connect(client, first, second)
    await client.post(
        "/v1/messages",
        headers=bearer(first[0]),
        json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "Private financial question"},
    )
    rows = (await client.get("/v1/notifications", headers=bearer(second[0]))).json()
    message = next(item for item in rows if item["kind"] == "message")
    assert "Private financial question" not in str(rows)
    assert (await client.put(f"/v1/notifications/{message['id']}/read", headers=bearer(first[0]))).status_code == 404
    assert (await client.put(f"/v1/notifications/{message['id']}/read", headers=bearer(second[0]))).status_code == 204
    await client.put(
        "/v1/me/notification-settings",
        headers=bearer(second[0]),
        json={"in_app": True, "messages": False, "email": False},
    )
    await client.post(
        "/v1/messages",
        headers=bearer(first[0]),
        json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "A second message"},
    )
    rows = (await client.get("/v1/notifications", headers=bearer(second[0]))).json()
    assert len([item for item in rows if item["kind"] == "message"]) == 1
    await client.put(f"/v1/blocks/{first[1]['user_id']}", headers=bearer(second[0]))
    assert (await client.get("/v1/notifications", headers=bearer(second[0]))).json() == []


async def test_presence_requires_an_accepted_connection_and_explicit_sharing(client, isolated_redis):
    from uuid import UUID

    from app import redis_client

    first = await account(client, "presence-caller", **PREFS)
    second = await account(client, "presence-peer", **PREFS)
    await connect(client, first, second)
    peer = UUID(second[1]["user_id"])
    await redis_client.touch_presence(peer, "device-one")
    await redis_client.touch_presence(peer, "device-two")
    rows = (await client.get("/v1/conversations", headers=bearer(first[0]))).json()
    assert rows[0]["presence"] == "hidden"
    await client.patch("/v1/me/profile", headers=bearer(second[0]), json={"share_presence": True})
    rows = (await client.get("/v1/conversations", headers=bearer(first[0]))).json()
    assert rows[0]["presence"] == "online"
    await redis_client.leave_presence(peer, "device-one")
    assert await redis_client.presence(peer, True) == "online"
    await redis_client.leave_presence(peer, "device-two")
    assert await redis_client.presence(peer, True) == "offline"
    await isolated_redis.zadd(f"roleplay:presence:{peer}", {"stale-crashed-device": 0})
    assert await redis_client.presence(peer, True) == "offline"


async def test_email_choice_does_not_require_in_app_display(client):
    from sqlalchemy import select

    from app.db import SessionLocal
    from app.models import Outbox

    first = await account(client, "email-choice-sender", **PREFS)
    second = await account(client, "email-choice-peer", **PREFS)
    await client.put(
        "/v1/me/notification-settings",
        headers=bearer(second[0]),
        json={"in_app": False, "messages": True, "email": True},
    )
    await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": second[1]["user_id"]})
    assert (await client.get("/v1/notifications", headers=bearer(second[0]))).json() == []
    async with SessionLocal() as db:
        job = await db.scalar(select(Outbox).where(Outbox.purpose == "email"))
        assert job is not None and job.encrypted_payload is not None
