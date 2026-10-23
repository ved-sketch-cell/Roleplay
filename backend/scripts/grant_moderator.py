"""Explicit operator-only role assignment; no API self-promotion route."""

import argparse
import asyncio

from sqlalchemy import select

from app.db import SessionLocal, engine
from app.models import User


async def main(email: str, revoke: bool):
    async with SessionLocal.begin() as db:
        user = await db.scalar(select(User).where(User.email == email.casefold()).with_for_update())
        if user is None:
            raise SystemExit("No account found; register the operator's account first")
        user.is_moderator = not revoke
    await engine.dispose()
    print("Moderator role updated. No password or identity details were printed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--revoke", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(args.email, args.revoke))
