from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select, update

from .chat_service import lock_users
from .community_schemas import PasswordResetInput, RecoveryRequest
from .config import get_settings
from .events import email_job, encrypt_payload
from .models import Outbox, PasswordReset, RefreshSession, User
from .rate_limit import enforce_limit
from .routes import DB
from .security import check_cookie_request, hash_password, now, token_hash

router = APIRouter(prefix="/v1/auth", tags=["Account recovery"])
GENERIC_RESPONSE = {"message": "If an eligible account exists, a recovery email will arrive shortly."}


@router.post("/forgot-password", status_code=202)
async def forgot_password(body: RecoveryRequest, request: Request, db: DB):
    check_cookie_request(request)
    if not get_settings().smtp_host:
        raise HTTPException(503, "Account recovery is currently unavailable. Contact this instance operator.")
    ip = request.client.host if request.client else "unknown"
    await enforce_limit(f"recovery-ip:{ip}", limit=10, window=3600)
    await enforce_limit(f"recovery-email:{str(body.email).casefold()}", limit=3, window=3600)
    # Queue the same encrypted request for both known and unknown addresses.
    # Account lookup and token generation happen off the HTTP request path.
    db.add(
        Outbox(
            purpose="recovery_request",
            encrypted_payload=encrypt_payload({"email": str(body.email).casefold()}),
            expires_at=now() + timedelta(minutes=20),
        )
    )
    await db.commit()
    return GENERIC_RESPONSE


@router.post("/reset-password")
async def reset_password(body: PasswordResetInput, request: Request, db: DB):
    check_cookie_request(request)
    ip = request.client.host if request.client else "unknown"
    await enforce_limit(f"reset-ip:{ip}", limit=10, window=300)
    invalid = HTTPException(400, "This recovery link is invalid or expired. Request a new link.")
    reset = await db.scalar(select(PasswordReset).where(PasswordReset.token_hash == token_hash(body.token)))
    if reset is None:
        raise invalid
    await lock_users(db, reset.user_id)
    await db.refresh(reset, with_for_update=True)
    user = await db.scalar(select(User).where(User.id == reset.user_id, User.active.is_(True)))
    if user is None or reset.used_at is not None or reset.expires_at <= now():
        raise invalid
    user.password_hash = await hash_password(body.password)
    # A reset proves mailbox access; it does not automatically sign the user in.
    await db.execute(update(PasswordReset).where(PasswordReset.user_id == user.id).values(used_at=now()))
    await db.execute(update(RefreshSession).where(RefreshSession.user_id == user.id).values(revoked_at=now()))
    await db.execute(
        update(Outbox)
        .where(Outbox.user_id == user.id, Outbox.reset_id.is_not(None), Outbox.status.in_(["pending", "working"]))
        .values(status="dead", encrypted_payload=None, error_code="reset_invalidated")
    )
    if get_settings().smtp_host:
        await email_job(
            db,
            user.id,
            {
                "subject": "Your ROLEPLAY password was changed",
                "body": "Your password was changed and all existing sessions were signed out. If you did not do this, contact the operator of this ROLEPLAY instance. Your password is never included in this email.",
            },
        )
    await db.commit()
    return {"message": "Password changed. Sign in with your new password."}
