from uuid import UUID, uuid4

from sqlalchemy import select

from app.db import SessionLocal
from app.models import ModerationAction, User
from tests.helpers import account, bearer
from tests.test_chat import PREFS, connect


async def test_reports_private_evidence_role_guards_removal_and_suspend_restore(client):
    first = await account(client, "reported-user", **PREFS)
    second = await account(client, "reporter-user", **PREFS)
    operator = await account(client, "assigned-moderator", **PREFS)
    outsider = await account(client, "outside-user", **PREFS)
    conversation = await connect(client, first, second)
    sent = (
        await client.post(
            "/v1/messages",
            headers=bearer(first[0]),
            json={"conversation_id": conversation, "client_message_id": str(uuid4()), "body": "Message being reported"},
        )
    ).json()
    report_body = {"message_id": sent["id"], "reason": "harassment", "details": "Please review this message"}
    assert (await client.post("/v1/reports", headers=bearer(outsider[0]), json=report_body)).status_code == 404
    created = await client.post("/v1/reports", headers=bearer(second[0]), json=report_body)
    assert created.status_code == 201
    assert "evidence" not in created.json() and "reporter_id" not in created.json()
    report_id = created.json()["id"]
    assert (await client.get("/v1/moderation/reports", headers=bearer(second[0]))).status_code == 403
    assert (
        await client.patch("/v1/me/profile", headers=bearer(second[0]), json={"is_moderator": True})
    ).status_code == 422
    async with SessionLocal.begin() as db:
        admin = await db.get(User, UUID(operator[1]["user_id"]))
        admin.is_moderator = True
    queue = (await client.get("/v1/moderation/reports", headers=bearer(operator[0]))).json()
    assert queue[0]["evidence"] == "Message being reported"
    action_path = f"/v1/moderation/reports/{report_id}/actions"
    assert (
        await client.post(
            action_path, headers=bearer(operator[0]), json={"action": "remove_message", "note": "Removed after review"}
        )
    ).status_code == 200
    page = (await client.get(f"/v1/conversations/{conversation}/messages", headers=bearer(second[0]))).json()
    assert page["messages"][0]["removed"] and page["messages"][0]["body"] == ""
    assert (
        await client.post(
            action_path, headers=bearer(operator[0]), json={"action": "suspend_user", "note": "Repeated harassment"}
        )
    ).status_code == 200
    assert (await client.get("/v1/me/profile", headers=bearer(first[0]))).status_code == 401
    assert (
        await client.get(f"/v1/conversations/{conversation}/messages", headers=bearer(second[0]))
    ).status_code == 404
    assert (
        await client.post(
            action_path,
            headers=bearer(operator[0]),
            json={"action": "restore_user", "note": "Appeal reviewed by operator"},
        )
    ).status_code == 200
    assert (await client.get("/v1/me/profile", headers=bearer(first[0]))).status_code == 401
    async with SessionLocal() as db:
        audit = list(await db.scalars(select(ModerationAction).where(ModerationAction.report_id == UUID(report_id))))
        assert [row.action for row in audit] == ["remove_message", "suspend_user", "restore_user"]


async def test_moderator_cannot_review_their_own_case(client):
    first = await account(client, "case-user", **PREFS)
    second = await account(client, "case-moderator", **PREFS)
    await connect(client, first, second)
    report = (
        await client.post(
            "/v1/reports",
            headers=bearer(second[0]),
            json={"target_user_id": first[1]["user_id"], "reason": "spam", "details": "Repeated spam"},
        )
    ).json()
    async with SessionLocal.begin() as db:
        user = await db.get(User, UUID(second[1]["user_id"]))
        user.is_moderator = True
    response = await client.post(
        f"/v1/moderation/reports/{report['id']}/actions",
        headers=bearer(second[0]),
        json={"action": "suspend_user", "note": "I reported this account"},
    )
    assert response.status_code == 403
