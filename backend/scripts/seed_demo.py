"""Explicit local-only sample users; never runs during API startup."""

import asyncio
import os

from sqlalchemy import select

from app.config import get_settings
from app.db import SessionLocal, engine
from app.models import Profile, User
from app.security import hash_password

DEMO_PROFILES = [
    (
        "curious-fox",
        "Curious Fox",
        "🦊",
        ["design", "technology", "creative coding"],
        ["learn together", "exchange ideas"],
        "casual",
    ),
    (
        "quiet-orbit",
        "Quiet Orbit",
        "🪐",
        ["technology", "science", "creative coding"],
        ["learn together"],
        "analytical",
    ),
    (
        "paper-crane",
        "Paper Crane",
        "🕊️",
        ["design", "career", "psychology"],
        ["exchange ideas", "career growth"],
        "empathetic",
    ),
    (
        "moss-mind",
        "Moss & Mind",
        "🌱",
        ["psychology", "science", "design"],
        ["learn together", "exchange ideas"],
        "casual",
    ),
]


async def main():
    if get_settings().environment != "development":
        raise SystemExit("Demo seeding is only available in development")
    password = os.environ.get("DEMO_PASSWORD", "")
    if len(password) < 12:
        raise SystemExit("Set DEMO_PASSWORD to a local demo password of at least 12 characters")
    hashed = await hash_password(password)
    async with SessionLocal.begin() as db:
        created = 0
        for slug, alias, avatar, interests, goals, communication in DEMO_PROFILES:
            email = slug + "@example.com"
            if await db.scalar(select(User.id).where(User.email == email)):
                continue
            user = User(email=email, password_hash=hashed)
            db.add(user)
            await db.flush()
            db.add(
                Profile(
                    user_id=user.id,
                    display_name=alias,
                    avatar=avatar,
                    bio="A local demo profile for preference matching.",
                    interests=interests,
                    goals=goals,
                    languages=["english"],
                    contact_modes=["text"],
                    communication_style=communication,
                    interaction_preference="one-on-one",
                    discoverable=True,
                )
            )
            created += 1
    await engine.dispose()
    print(f"Created {created} local demo profiles. No production accounts were added.")


if __name__ == "__main__":
    asyncio.run(main())
