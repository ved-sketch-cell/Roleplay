"""Durable notification/outbox writes. External I/O happens only in the worker."""

import json
from datetime import timedelta
from uuid import UUID

from cryptography.fernet import Fernet
from fastapi import HTTPException
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .models import Notification, NotificationPreference, Outbox
from .security import now


def cipher() -> Fernet:
    key = get_settings().outbox_encryption_key
    if not key:
        raise HTTPException(503, "Account email services are temporarily unavailable")
    return Fernet(key.get_secret_value().encode())


def encrypt_payload(payload: dict) -> str:
    return cipher().encrypt(json.dumps(payload).encode()).decode()


def decrypt_payload(payload: str) -> dict:
    return json.loads(cipher().decrypt(payload.encode()))


async def realtime(db: AsyncSession, user_id: UUID, event: dict) -> None:
    db.add(Outbox(user_id=user_id, purpose="realtime", event=event, expires_at=now() + timedelta(hours=24)))


async def email_job(
    db: AsyncSession, user_id: UUID, payload: dict, *, reset_id: UUID | None = None, expires_at=None
) -> None:
    db.add(
        Outbox(
            user_id=user_id,
            reset_id=reset_id,
            purpose="email",
            encrypted_payload=encrypt_payload(payload),
            expires_at=expires_at or now() + timedelta(days=1),
        )
    )


async def notification(
    db: AsyncSession, user_id: UUID, *, kind: str, title: str, data: dict, event_key: str, actor_id: UUID | None = None
) -> None:
    preference = await db.get(NotificationPreference, user_id)
    if preference and kind == "message" and not preference.messages:
        return
    statement = insert(Notification).values(
        user_id=user_id, kind=kind, title=title, data=data, event_key=event_key, actor_id=actor_id
    )
    created = await db.scalar(
        statement.on_conflict_do_nothing(index_elements=[Notification.user_id, Notification.event_key]).returning(
            Notification.id
        )
    )
    if created is None:
        return
    if preference is None or preference.in_app:
        await realtime(db, user_id, {"type": "notifications.updated"})
    if preference and preference.email and get_settings().smtp_host and get_settings().outbox_encryption_key:
        # Email does not carry private message bodies or the sender's identity.
        await email_job(
            db,
            user_id,
            {
                "subject": title,
                "body": f"{title}. Open ROLEPLAY to review: {get_settings().public_web_url}/#/app/notifications",
            },
        )
