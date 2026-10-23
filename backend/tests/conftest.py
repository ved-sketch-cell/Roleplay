import os

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text

os.environ["ENVIRONMENT"] = "test"
os.environ["JWT_SECRET"] = "local-test-secret-never-use-in-production-123456"
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:5432/roleplay_test"
)
os.environ["RATE_LIMITS_ENABLED"] = "false"
os.environ["COOKIE_SECURE"] = "false"
os.environ["OUTBOX_ENCRYPTION_KEY"] = "6oZ8BYJPVtrdtGlQO-OfEYaJZZf0rp4HgJqtLWlWplQ="
os.environ["SMTP_HOST"] = "test-smtp.invalid"
os.environ["SMTP_STARTTLS"] = "false"

from app.db import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def client():
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL to a migrated, disposable PostgreSQL test database")
    if "roleplay_test" not in url and os.environ.get("TEST_ALLOW_PGLITE") != "1":
        pytest.fail("Integration tests only reset roleplay_test, or an explicitly opted-in PGlite test instance")
    async with SessionLocal.begin() as db:
        await db.execute(
            text(
                "TRUNCATE rate_limit_buckets, recommendation_feedback, blocks, refresh_sessions, profiles, users CASCADE"
            )
        )
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
        headers={"X-Roleplay-CSRF": "1", "Origin": "http://localhost:5173"},
    ) as value:
        yield value
    await engine.dispose()


@pytest.fixture
def app_under_test():
    return app


@pytest_asyncio.fixture(autouse=True)
async def isolated_redis(monkeypatch):
    from fakeredis.aioredis import FakeRedis

    from app import redis_client

    fake = FakeRedis(decode_responses=True)
    monkeypatch.setattr(redis_client, "get_redis", lambda: fake)
    yield fake
    await fake.aclose()
