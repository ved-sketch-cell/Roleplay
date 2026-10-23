"""Run daily to prune expired sessions and rate-limit buckets."""

import asyncio
from datetime import timedelta

from sqlalchemy import delete

from app.db import SessionLocal, engine
from app.models import Outbox, PasswordReset, RateLimitBucket, RefreshSession
from app.security import now


async def main():
    async with SessionLocal.begin() as db:
        await db.execute(delete(RateLimitBucket).where(RateLimitBucket.expires_at < now()))
        # Retain recently revoked tokens briefly so reuse can still be detected.
        await db.execute(delete(RefreshSession).where(RefreshSession.expires_at < now() - timedelta(days=1)))
        await db.execute(delete(PasswordReset).where(PasswordReset.expires_at < now() - timedelta(days=1)))
        await db.execute(
            delete(Outbox).where(Outbox.status.in_(["sent", "dead"]), Outbox.created_at < now() - timedelta(days=7))
        )
    await engine.dispose()
    print("Pruned expired rate buckets, sessions, reset tokens, and finished outbox jobs.")


if __name__ == "__main__":
    asyncio.run(main())
