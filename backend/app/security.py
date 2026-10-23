import hashlib
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from .config import get_settings
from .db import get_db
from .models import RefreshSession, User
from .schemas import TokenPair

password_hasher = PasswordHash.recommended()
dummy_hash = password_hasher.hash(secrets.token_urlsafe(24))
bearer = HTTPBearer(auto_error=False)
COOKIE_NAME = "roleplay_refresh"
COOKIE_PATH = "/"


def now() -> datetime:
    return datetime.now(timezone.utc)


def token_hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


async def hash_password(value: str) -> str:
    return await run_in_threadpool(password_hasher.hash, value)


async def verify_password(value: str, hashed: str) -> bool:
    return await run_in_threadpool(password_hasher.verify, value, hashed)


def unauthorized() -> HTTPException:
    return HTTPException(401, "Sign in again to continue", headers={"WWW-Authenticate": "Bearer"})


def check_cookie_request(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin is not None and origin not in get_settings().cors_origins:
        raise HTTPException(403, "Origin is not allowed")
    if request.headers.get("x-roleplay-csrf") != "1":
        raise HTTPException(403, "The session request header is required")


def clear_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        COOKIE_NAME,
        path=COOKIE_PATH,
        secure=settings.cookie_secure,
        httponly=True,
        samesite="none" if settings.cookie_secure else "lax",
    )


async def issue_session(db: AsyncSession, user: User, response: Response) -> TokenPair:
    settings = get_settings()
    raw_refresh = secrets.token_urlsafe(48)
    session = RefreshSession(
        user_id=user.id,
        token_hash=token_hash(raw_refresh),
        expires_at=now() + timedelta(days=settings.refresh_token_days),
    )
    db.add(session)
    await db.flush()
    issued_at = now()
    token = jwt.encode(
        {
            "sub": str(user.id),
            "sid": str(session.id),
            "iss": "roleplay",
            "aud": "roleplay-api",
            "iat": issued_at,
            "nbf": issued_at,
            "exp": issued_at + timedelta(minutes=settings.access_token_minutes),
            "type": "access",
        },
        settings.jwt_secret.get_secret_value(),
        algorithm="HS256",
    )
    response.set_cookie(
        COOKIE_NAME,
        raw_refresh,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="none" if settings.cookie_secure else "lax",
        max_age=settings.refresh_token_days * 86400,
        path=COOKIE_PATH,
    )
    response.headers["Cache-Control"] = "no-store"
    return TokenPair(access_token=token, expires_in=settings.access_token_minutes * 60)


@dataclass
class AuthContext:
    user: User
    session_id: UUID


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthContext:
    if credentials is None:
        raise unauthorized()
    try:
        payload = jwt.decode(
            credentials.credentials,
            get_settings().jwt_secret.get_secret_value(),
            algorithms=["HS256"],
            audience="roleplay-api",
            issuer="roleplay",
            options={"require": ["sub", "sid", "exp", "iat", "nbf", "iss", "aud", "type"]},
        )
        if payload["type"] != "access":
            raise unauthorized()
        user_id, session_id = UUID(payload["sub"]), UUID(payload["sid"])
    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise unauthorized() from None
    return await lookup_session(db, user_id, session_id)


async def lookup_session(db: AsyncSession, user_id: UUID, session_id: UUID) -> AuthContext:
    user = await db.scalar(
        select(User)
        .join(RefreshSession, RefreshSession.user_id == User.id)
        .where(
            User.id == user_id,
            User.active.is_(True),
            RefreshSession.id == session_id,
            RefreshSession.revoked_at.is_(None),
            RefreshSession.expires_at > now(),
        )
    )
    if user is None:
        raise unauthorized()
    return AuthContext(user, session_id)
