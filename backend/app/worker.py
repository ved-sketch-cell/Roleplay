"""Lease/retry worker for durable realtime hints and encrypted email jobs."""

import asyncio
import logging
import secrets
import smtplib
import ssl
from datetime import timedelta
from email.message import EmailMessage

from cryptography.fernet import InvalidToken
from redis.exceptions import RedisError
from sqlalchemy import and_, or_, select
from starlette.concurrency import run_in_threadpool

from . import redis_client
from .chat_service import lock_users
from .config import get_settings
from .db import SessionLocal, engine
from .events import decrypt_payload, email_job
from .models import Outbox, PasswordReset, User
from .security import now, token_hash

logger = logging.getLogger("roleplay.worker")


def deliver_email(address: str, payload: dict, job_id) -> None:
    settings = get_settings()
    if not settings.smtp_host:
        raise RuntimeError("smtp_unconfigured")
    message = EmailMessage()
    message["From"], message["To"], message["Subject"] = str(settings.smtp_from), address, payload["subject"]
    message["Message-ID"] = f"<{job_id}@roleplay>"
    message.set_content(payload["body"])
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        if settings.smtp_starttls:
            smtp.starttls(context=ssl.create_default_context())
        if settings.smtp_username:
            smtp.login(
                settings.smtp_username, settings.smtp_password.get_secret_value() if settings.smtp_password else ""
            )
        smtp.send_message(message)


async def claim_job():
    async with SessionLocal.begin() as db:
        job = await db.scalar(
            select(Outbox)
            .where(
                or_(
                    and_(Outbox.status == "pending", Outbox.available_at <= now()),
                    and_(Outbox.status == "working", Outbox.lease_until <= now()),
                )
            )
            .order_by(Outbox.available_at, Outbox.id)
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if job is None:
            return None
        if job.expires_at <= now():
            job.status, job.encrypted_payload, job.error_code = "dead", None, "expired"
            return "expired"
        job.status, job.lease_until, job.attempts = "working", now() + timedelta(seconds=45), job.attempts + 1
        return job


async def process_recovery(job):
    payload = decrypt_payload(job.encrypted_payload)
    async with SessionLocal.begin() as db:
        user = await db.scalar(select(User).where(User.email == payload["email"], User.active.is_(True)))
        if user is None:
            return
        await lock_users(db, user.id)
        # Replay after a crash should not generate a second token/email job.
        reset = await db.get(PasswordReset, job.id)
        if reset:
            return
        raw = secrets.token_urlsafe(48)
        reset = PasswordReset(
            id=job.id,
            user_id=user.id,
            token_hash=token_hash(raw),
            expires_at=now() + timedelta(minutes=get_settings().reset_token_minutes),
        )
        db.add(reset)
        await db.flush()
        link = f"{get_settings().public_web_url}/#/app/recover/{raw}"
        await email_job(
            db,
            user.id,
            {
                "subject": "Reset your ROLEPLAY password",
                "body": f"Use this single-use link within {get_settings().reset_token_minutes} minutes:\n{link}\n\nIf you did not request this, ignore this email. Your account has not been changed.",
            },
            reset_id=reset.id,
            expires_at=reset.expires_at,
        )


async def execute_job(job):
    if job.purpose == "recovery_request":
        await process_recovery(job)
    elif job.purpose == "realtime":
        import json

        await redis_client.get_redis().publish(f"roleplay:events:{job.user_id}", json.dumps(job.event))
    elif job.purpose == "email":
        async with SessionLocal() as db:
            user = await db.get(User, job.user_id)
            if user is None:
                return
            if job.reset_id:
                reset = await db.get(PasswordReset, job.reset_id)
                if reset is None or reset.used_at or reset.expires_at <= now() or not user.active:
                    return
            await run_in_threadpool(deliver_email, user.email, decrypt_payload(job.encrypted_payload), job.id)


async def process_one() -> bool:
    job = await claim_job()
    if job is None:
        return False
    if job == "expired":
        return True
    failure = None
    try:
        await execute_job(job)
    except InvalidToken:
        failure = "encryption_key_mismatch"
    except (RedisError, OSError, smtplib.SMTPException, RuntimeError):
        failure = "delivery_unavailable"
    except Exception:
        failure = "delivery_failed"
        logger.error("Unexpected outbox delivery failure; review worker configuration")
    async with SessionLocal.begin() as db:
        current = await db.get(Outbox, job.id, with_for_update=True)
        if current is None or current.status != "working" or current.attempts != job.attempts:
            return True
        current.lease_until = None
        if failure:
            current.error_code = failure
            if current.attempts >= 8 or current.expires_at <= now():
                current.status, current.encrypted_payload = "dead", None
                logger.warning("Outbox job exhausted retries; check delivery health")
            else:
                current.status = "pending"
                current.available_at = now() + timedelta(seconds=min(300, 2**current.attempts))
        else:
            current.status, current.encrypted_payload, current.event, current.error_code = "sent", None, {}, None
    return True


async def main():
    try:
        while True:
            try:
                if not await process_one():
                    await asyncio.sleep(get_settings().worker_poll_seconds)
            except Exception:
                logger.error("Worker database is unavailable; retrying")
                await asyncio.sleep(5)
    finally:
        await redis_client.close_redis()
        await engine.dispose()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
