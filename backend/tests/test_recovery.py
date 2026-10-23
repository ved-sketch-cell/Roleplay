from datetime import timedelta
from uuid import UUID

import pytest
from sqlalchemy import select

from app import worker
from app.db import SessionLocal
from app.events import decrypt_payload
from app.models import Outbox, PasswordReset
from app.security import now
from tests.helpers import PASSWORD, account, bearer

NEW_PASSWORD = "A-new-local-password-only-456!"


async def drain():
    for _ in range(100):
        if not await worker.process_one():
            return
    pytest.fail("Outbox did not drain within the bounded test run")


async def test_recovery_generic_encrypted_single_use_and_session_revocation(client, monkeypatch):
    token, profile = await account(client, "recover-owner")
    known = await client.post("/v1/auth/forgot-password", json={"email": "recover-owner@example.com"})
    unknown = await client.post("/v1/auth/forgot-password", json={"email": "missing@example.com"})
    assert known.status_code == unknown.status_code == 202 and known.json() == unknown.json()
    async with SessionLocal() as db:
        jobs = list(await db.scalars(select(Outbox).where(Outbox.purpose == "recovery_request")))
        assert len(jobs) == 2 and all("example.com" not in item.encrypted_payload for item in jobs)
        assert "recover-owner@example.com" not in str([item.event for item in jobs])
    delivered = []
    monkeypatch.setattr(worker, "deliver_email", lambda address, payload, job_id: delivered.append((address, payload)))
    await drain()
    assert len(delivered) == 1 and delivered[0][0] == "recover-owner@example.com"
    raw = delivered[0][1]["body"].split("/#/app/recover/")[1].split()[0]
    assert (await client.get("/v1/me/profile", headers=bearer(token))).status_code == 200
    body = {"token": raw, "password": NEW_PASSWORD, "confirm_password": NEW_PASSWORD}
    assert (await client.post("/v1/auth/reset-password", json=body | {"confirm_password": PASSWORD})).status_code == 422
    assert (await client.post("/v1/auth/reset-password", json=body)).status_code == 200
    assert (await client.get("/v1/me/profile", headers=bearer(token))).status_code == 401
    assert (await client.post("/v1/auth/reset-password", json=body)).status_code == 400
    assert (
        await client.post("/v1/auth/login", json={"email": "recover-owner@example.com", "password": PASSWORD})
    ).status_code == 401
    assert (
        await client.post("/v1/auth/login", json={"email": "recover-owner@example.com", "password": NEW_PASSWORD})
    ).status_code == 200
    await drain()
    assert len(delivered) == 2 and NEW_PASSWORD not in str(delivered)
    async with SessionLocal() as db:
        assert all(
            item.encrypted_payload is None for item in await db.scalars(select(Outbox).where(Outbox.status == "sent"))
        )
        assert (
            await db.scalar(select(PasswordReset.used_at).where(PasswordReset.user_id == UUID(profile["user_id"])))
            is not None
        )


async def test_expired_and_invalid_reset_tokens_do_not_change_account(client, monkeypatch):
    token, _ = await account(client, "expired-reset")
    await client.post("/v1/auth/forgot-password", json={"email": "expired-reset@example.com"})
    monkeypatch.setattr(worker, "deliver_email", lambda *args: None)
    await worker.process_one()
    async with SessionLocal.begin() as db:
        email = await db.scalar(select(Outbox).where(Outbox.purpose == "email"))
        raw = decrypt_payload(email.encrypted_payload)["body"].split("/#/app/recover/")[1].split()[0]
        reset = await db.get(PasswordReset, email.reset_id)
        reset.expires_at = now() - timedelta(seconds=1)
    body = {"token": raw, "password": NEW_PASSWORD, "confirm_password": NEW_PASSWORD}
    assert (await client.post("/v1/auth/reset-password", json=body)).status_code == 400
    assert (
        await client.post("/v1/auth/reset-password", json=body | {"token": "unknown-reset-token-of-sufficient-length"})
    ).status_code == 400
    assert (await client.get("/v1/me/profile", headers=bearer(token))).status_code == 200


async def test_worker_retries_failed_delivery_and_recovers_a_stale_lease(client, monkeypatch):
    await account(client, "retry-owner")
    await client.post("/v1/auth/forgot-password", json={"email": "retry-owner@example.com"})
    await worker.process_one()

    def fail(*args):
        raise OSError("SMTP failure with private details which must not be logged")

    monkeypatch.setattr(worker, "deliver_email", fail)
    await worker.process_one()
    async with SessionLocal.begin() as db:
        email = await db.scalar(select(Outbox).where(Outbox.purpose == "email"))
        assert email.status == "pending" and email.error_code == "delivery_unavailable" and email.attempts == 1
        assert email.encrypted_payload is not None
        email.status, email.lease_until = "working", now() - timedelta(seconds=1)
    delivered = []
    monkeypatch.setattr(worker, "deliver_email", lambda *args: delivered.append(True))
    await worker.process_one()
    assert delivered == [True]
    async with SessionLocal() as db:
        email = await db.scalar(select(Outbox).where(Outbox.purpose == "email"))
        assert email.status == "sent" and email.attempts == 2 and email.encrypted_payload is None


async def test_local_smtp_transport_delivers_recovery_link(client, monkeypatch):
    import socket
    from email import policy
    from email.parser import BytesParser

    from aiosmtpd.controller import Controller

    from app.config import get_settings

    captured = []

    class Capture:
        async def handle_DATA(self, server, session, envelope):
            captured.append(envelope.content)
            return "250 Captured locally"

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    controller = Controller(Capture(), hostname="127.0.0.1", port=port)
    controller.start()
    try:
        settings = get_settings()
        monkeypatch.setattr(settings, "smtp_host", "127.0.0.1")
        monkeypatch.setattr(settings, "smtp_port", port)
        monkeypatch.setattr(settings, "smtp_starttls", False)
        await account(client, "smtp-test")
        await client.post("/v1/auth/forgot-password", json={"email": "smtp-test@example.com"})
        await drain()
        assert len(captured) == 1
        message = BytesParser(policy=policy.default).parsebytes(captured[0])
        assert message["To"] == "smtp-test@example.com"
        assert "/#/app/recover/" in message.get_content()
        assert PASSWORD not in message.get_content()
    finally:
        controller.stop()
