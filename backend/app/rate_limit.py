import hashlib
import time
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.dialects.postgresql import insert

from .config import get_settings
from .db import SessionLocal
from .models import RateLimitBucket


async def enforce_limit(subject: str, *, limit: int, window: int = 60) -> None:
    """Atomic across API workers; only a hashed subject is stored."""
    if not get_settings().rate_limits_enabled:
        return
    timestamp = int(time.time())
    bucket = timestamp // window
    key = hashlib.sha256(f"{subject}:{bucket}".encode()).hexdigest()
    expires = datetime.fromtimestamp((bucket + 1) * window, timezone.utc)
    statement = insert(RateLimitBucket).values(key=key, attempts=1, expires_at=expires)
    statement = statement.on_conflict_do_update(
        index_elements=[RateLimitBucket.key], set_={"attempts": RateLimitBucket.attempts + 1}
    ).returning(RateLimitBucket.attempts)
    async with SessionLocal.begin() as db:
        count = await db.scalar(statement)
    if count > limit:
        raise HTTPException(
            429, "Please wait before trying again", headers={"Retry-After": str((bucket + 1) * window - timestamp)}
        )
