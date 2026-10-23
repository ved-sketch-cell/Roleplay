from uuid import uuid4

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Message, Outbox, ReadReceipt
from tests.helpers import account, bearer

PREFS = dict(discoverable=True, interests=["design"], languages=["english"], contact_modes=["text"])


async def connect(client, first, second):
    response = await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": second[1]["user_id"]})
    assert response.status_code == 201, response.text
    request = response.json()
    accepted = await client.post(
        f"/v1/connections/{request['id']}/decision", headers=bearer(second[0]), json={"action": "accept"}
    )
    assert accepted.status_code == 200, accepted.text
    return accepted.json()["conversation_id"]


async def test_chat_requires_mutual_consent_and_participant_access(client):
    first = await account(client, "requester", **PREFS)
    second = await account(client, "recipient", **PREFS)
    third = await account(client, "outsider", **PREFS)
    response = await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": second[1]["user_id"]})
    request_id = response.json()["id"]
    assert (
        await client.post(f"/v1/connections/{request_id}/decision", headers=bearer(first[0]), json={"action": "accept"})
    ).status_code == 403
    assert (
        await client.post(f"/v1/connections/{request_id}/decision", headers=bearer(third[0]), json={"action": "accept"})
    ).status_code == 404
    assert (await client.get("/v1/conversations", headers=bearer(first[0]))).json() == []
    accepted = await client.post(
        f"/v1/connections/{request_id}/decision", headers=bearer(second[0]), json={"action": "accept"}
    )
    conversation_id = accepted.json()["conversation_id"]
    assert (
        await client.get(f"/v1/conversations/{conversation_id}/messages", headers=bearer(third[0]))
    ).status_code == 404
    assert (
        await client.post(
            "/v1/messages",
            headers=bearer(third[0]),
            json={"conversation_id": conversation_id, "client_message_id": str(uuid4()), "body": "Not a member"},
        )
    ).status_code == 404
    # Hiding a discovery profile does not revoke an existing accepted connection.
    await client.patch("/v1/me/profile", headers=bearer(second[0]), json={"discoverable": False})
    assert (
        await client.post(
            "/v1/messages",
            headers=bearer(first[0]),
            json={"conversation_id": conversation_id, "client_message_id": str(uuid4()), "body": "Hello"},
        )
    ).status_code == 201


async def test_message_retry_pagination_and_read_receipts(client):
    first = await account(client, "sender", **PREFS)
    second = await account(client, "reader", **PREFS)
    conversation = await connect(client, first, second)
    value = {"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "A private idea"}
    sent = await client.post("/v1/messages", headers=bearer(first[0]), json=value)
    replay = await client.post("/v1/messages", headers=bearer(first[0]), json=value)
    assert sent.json()["id"] == replay.json()["id"]
    assert sent.json()["sequence"] == 1
    assert (
        await client.post("/v1/messages", headers=bearer(first[0]), json=value | {"body": "Different body"})
    ).status_code == 409
    assert (
        await client.post("/v1/messages", headers=bearer(first[0]), json=value | {"sender_id": second[1]["user_id"]})
    ).status_code == 422
    for index in range(2, 5):
        await client.post(
            "/v1/messages",
            headers=bearer(second[0]),
            json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": f"Reply {index}"},
        )
    page = (await client.get(f"/v1/conversations/{conversation}/messages?limit=2", headers=bearer(first[0]))).json()
    assert [item["sequence"] for item in page["messages"]] == [3, 4] and page["has_more"]
    page = (
        await client.get(f"/v1/conversations/{conversation}/messages?after=1&limit=2", headers=bearer(first[0]))
    ).json()
    assert [item["sequence"] for item in page["messages"]] == [2, 3]
    assert (
        await client.get(f"/v1/conversations/{conversation}/messages?after=1&before=3", headers=bearer(first[0]))
    ).status_code == 422
    assert (
        await client.put(f"/v1/conversations/{conversation}/read", headers=bearer(second[0]), json={"sequence": 5})
    ).status_code == 422
    for sequence in [4, 1]:
        assert (
            await client.put(
                f"/v1/conversations/{conversation}/read", headers=bearer(second[0]), json={"sequence": sequence}
            )
        ).status_code == 204
    from uuid import UUID

    async with SessionLocal() as db:
        receipt = await db.get(ReadReceipt, (UUID(conversation), UUID(second[1]["user_id"])))
        assert receipt.last_read_sequence == 4
        assert len(list(await db.scalars(select(Message)))) == 4
        events = list(await db.scalars(select(Outbox).where(Outbox.purpose == "realtime")))
        assert all("A private idea" not in str(item.event) for item in events)


async def test_block_stops_history_and_send_and_unblock_does_not_restore_consent(client):
    first = await account(client, "blocked-sender", **PREFS)
    second = await account(client, "blocker", **PREFS)
    conversation = await connect(client, first, second)
    value = {"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "Hello"}
    assert (await client.post("/v1/messages", headers=bearer(first[0]), json=value)).status_code == 201
    await client.put(f"/v1/blocks/{first[1]['user_id']}", headers=bearer(second[0]))
    assert (
        await client.post("/v1/messages", headers=bearer(first[0]), json=value | {"client_message_id": str(uuid4())})
    ).status_code == 404
    assert (await client.get(f"/v1/conversations/{conversation}/messages", headers=bearer(first[0]))).status_code == 404
    assert (await client.get("/v1/conversations", headers=bearer(second[0]))).json() == []
    await client.delete(f"/v1/blocks/{first[1]['user_id']}", headers=bearer(second[0]))
    assert (await client.get(f"/v1/conversations/{conversation}/messages", headers=bearer(first[0]))).status_code == 404


async def test_decline_and_text_preference_constraints(client):
    first = await account(client, "first-person", **PREFS)
    second = await account(client, "second-person", **PREFS)
    response = await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": second[1]["user_id"]})
    request_id = response.json()["id"]
    assert (
        await client.post(
            f"/v1/connections/{request_id}/decision", headers=bearer(second[0]), json={"action": "decline"}
        )
    ).status_code == 200
    assert (
        await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": second[1]["user_id"]})
    ).status_code == 404
    audio = await account(client, "audio-only", **(PREFS | {"contact_modes": ["audio"]}))
    assert (
        await client.post("/v1/connections", headers=bearer(first[0]), json={"target_id": audio[1]["user_id"]})
    ).status_code in {404, 422}


async def test_retraction_keeps_sequence_and_hides_original_text(client):
    first = await account(client, "retract-sender", **PREFS)
    second = await account(client, "retract-reader", **PREFS)
    conversation = await connect(client, first, second)
    sent = (
        await client.post(
            "/v1/messages",
            headers=bearer(first[0]),
            json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "Remove this"},
        )
    ).json()
    assert (await client.delete(f"/v1/messages/{sent['id']}", headers=bearer(second[0]))).status_code == 404
    assert (await client.delete(f"/v1/messages/{sent['id']}", headers=bearer(first[0]))).status_code == 204
    page = (await client.get(f"/v1/conversations/{conversation}/messages", headers=bearer(second[0]))).json()
    assert page["messages"][0]["sequence"] == 1 and page["messages"][0]["removed"] and page["messages"][0]["body"] == ""


async def test_account_export_and_deletion_cover_connected_data(client):
    from uuid import UUID

    from sqlalchemy import func

    from app.models import Connection, Conversation, Notification, Report
    from tests.helpers import PASSWORD

    first = await account(client, "erase-connected", **PREFS)
    second = await account(client, "erase-peer", **PREFS)
    conversation = await connect(client, first, second)
    for token, text in [(first[0], "My own exportable text"), (second[0], "Peer text excluded from my export")]:
        await client.post(
            "/v1/messages",
            headers=bearer(token),
            json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": text},
        )
    await client.post(
        "/v1/reports",
        headers=bearer(first[0]),
        json={"target_user_id": second[1]["user_id"], "reason": "other", "details": "Test report"},
    )
    exported = await client.get("/v1/me/export", headers=bearer(first[0]))
    assert "My own exportable text" in exported.text
    assert "Peer text excluded from my export" not in exported.text
    assert (
        await client.request("DELETE", "/v1/me", headers=bearer(first[0]), json={"password": PASSWORD})
    ).status_code == 204
    async with SessionLocal() as db:
        assert await db.get(Conversation, UUID(conversation)) is None
        assert await db.scalar(select(func.count()).select_from(Message)) == 0
        assert await db.scalar(select(func.count()).select_from(Connection)) == 0
        assert await db.scalar(select(func.count()).select_from(Report)) == 0
        assert (
            await db.scalar(
                select(func.count()).select_from(Notification).where(Notification.user_id == UUID(first[1]["user_id"]))
            )
            == 0
        )
