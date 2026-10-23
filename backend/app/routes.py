from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy import delete, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .ai import RECOMMEND_TOOL, interpret_request
from .config import get_settings
from .db import get_db
from .models import (
    Block,
    Connection,
    Feedback,
    Message,
    Notification,
    Profile,
    RefreshSession,
    Report,
    User,
)
from .rate_limit import enforce_limit
from .recommendations import ensure_discovery, ensure_eligible_target, my_profile, recommend
from .schemas import (
    AIRecommendations,
    AIRequest,
    DeleteAccount,
    FeedbackInput,
    Login,
    MyProfile,
    ProfileUpdate,
    RecommendationFilters,
    RecommendationQuery,
    Recommendations,
    Register,
    TokenPair,
)
from .security import (
    COOKIE_NAME,
    AuthContext,
    check_cookie_request,
    clear_cookie,
    dummy_hash,
    get_current_user,
    hash_password,
    issue_session,
    now,
    token_hash,
    unauthorized,
    verify_password,
)

router = APIRouter(prefix="/v1")
DB = Annotated[AsyncSession, Depends(get_db)]
Auth = Annotated[AuthContext, Depends(get_current_user)]


async def auth_limit(request: Request, email: str | None = None) -> None:
    ip = request.client.host if request.client else "unknown"
    await enforce_limit(f"auth-ip:{ip}", limit=30, window=300)
    if email is not None:
        await enforce_limit(f"auth-account:{email.casefold()}", limit=10, window=300)


@router.post("/auth/register", response_model=TokenPair, status_code=201, tags=["Authentication"])
async def register(body: Register, request: Request, response: Response, db: DB):
    check_cookie_request(request)
    email = str(body.email).casefold()
    await auth_limit(request, email)
    user = User(email=email, password_hash=await hash_password(body.password))
    db.add(user)
    try:
        await db.flush()
        db.add(Profile(user_id=user.id, display_name=body.display_name))
        tokens = await issue_session(db, user, response)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "An account with that email already exists") from None
    return tokens


@router.post("/auth/login", response_model=TokenPair, tags=["Authentication"])
async def login(body: Login, request: Request, response: Response, db: DB):
    check_cookie_request(request)
    email = str(body.email).casefold()
    await auth_limit(request, email)
    user = await db.scalar(select(User).where(User.email == email))
    valid = await verify_password(body.password, user.password_hash if user else dummy_hash)
    if not user or not valid or not user.active:
        raise HTTPException(401, "Email or password is incorrect")
    tokens = await issue_session(db, user, response)
    await db.commit()
    return tokens


@router.post("/auth/refresh", response_model=TokenPair, tags=["Authentication"])
async def refresh(request: Request, response: Response, db: DB):
    check_cookie_request(request)
    await auth_limit(request)
    raw = request.cookies.get(COOKIE_NAME)
    if not raw or len(raw) > 128:
        raise unauthorized()
    session = await db.scalar(
        select(RefreshSession).where(RefreshSession.token_hash == token_hash(raw)).with_for_update()
    )
    if session is None or session.expires_at <= now():
        raise unauthorized()
    if session.revoked_at is not None:
        # Reuse of a rotated token revokes remaining sessions for that account.
        await db.execute(
            update(RefreshSession).where(RefreshSession.user_id == session.user_id).values(revoked_at=now())
        )
        await db.commit()
        raise unauthorized()
    user = await db.get(User, session.user_id)
    if user is None or not user.active:
        raise unauthorized()
    session.revoked_at = now()
    tokens = await issue_session(db, user, response)
    await db.commit()
    return tokens


@router.post("/auth/logout", status_code=204, tags=["Authentication"])
async def logout(request: Request, response: Response, auth: Auth, db: DB):
    check_cookie_request(request)
    await db.execute(update(RefreshSession).where(RefreshSession.id == auth.session_id).values(revoked_at=now()))
    await db.commit()
    clear_cookie(response)


@router.get("/me/profile", response_model=MyProfile, tags=["Profiles"])
async def profile(auth: Auth, db: DB):
    return await my_profile(db, auth.user.id)


@router.patch("/me/profile", response_model=MyProfile, tags=["Profiles"])
async def update_profile(body: ProfileUpdate, auth: Auth, db: DB):
    await enforce_limit(f"profile:{auth.user.id}", limit=30)
    current = await my_profile(db, auth.user.id)
    for field, value in body.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(current, field, value)
    await db.commit()
    await db.refresh(current)
    return current


@router.get("/recommendations", response_model=Recommendations, tags=["Recommendations"])
async def recommendations(auth: Auth, db: DB, filters: Annotated[RecommendationQuery, Query()]):
    await enforce_limit(f"recommend:{auth.user.id}", limit=60)
    return await recommend(db, auth.user.id, filters)


@router.post("/tools/recommend-users", response_model=Recommendations, tags=["AI tools"])
async def recommendation_tool(body: RecommendationFilters, auth: Auth, db: DB):
    await enforce_limit(f"recommend:{auth.user.id}", limit=60)
    return await recommend(db, auth.user.id, body)


@router.get("/tools/recommend-users/schema", tags=["AI tools"])
async def tool_schema():
    return {
        "tool": RECOMMEND_TOOL,
        "method": "POST",
        "path": "/v1/tools/recommend-users",
        "authorization": "Bearer token for the requesting user",
        "ai_configured": bool(get_settings().openai_api_key and get_settings().openai_model),
    }


@router.post("/ai/recommendations", response_model=AIRecommendations, tags=["AI tools"])
async def ai_recommendations(body: AIRequest, auth: Auth, db: DB):
    if not body.share_preferences_with_ai:
        raise HTTPException(403, "Allow sharing your declared interests with the AI provider for this request")
    await enforce_limit(f"ai:{auth.user.id}", limit=5)
    current = await my_profile(db, auth.user.id)
    ensure_discovery(current)
    filters = await interpret_request(body.prompt, current)
    # Identity, authorization, eligibility and scoring are always server-side.
    result = await recommend(db, auth.user.id, filters)
    return AIRecommendations(**result.model_dump(), interpreted_filters=filters)


@router.post("/recommendations/feedback", status_code=204, tags=["Recommendations"])
async def feedback(body: FeedbackInput, auth: Auth, db: DB):
    current = await my_profile(db, auth.user.id)
    await ensure_eligible_target(db, current, body.target_id)
    statement = insert(Feedback).values(user_id=auth.user.id, target_id=body.target_id, action=body.action)
    await db.execute(
        statement.on_conflict_do_update(
            index_elements=[Feedback.user_id, Feedback.target_id], set_={"action": body.action, "updated_at": now()}
        )
    )
    await db.commit()


@router.delete("/recommendations/feedback/{target_id}", status_code=204, tags=["Recommendations"])
async def clear_feedback(target_id: UUID, auth: Auth, db: DB):
    await db.execute(delete(Feedback).where(Feedback.user_id == auth.user.id, Feedback.target_id == target_id))
    await db.commit()


@router.put("/blocks/{target_id}", status_code=204, tags=["Privacy"])
async def block(target_id: UUID, auth: Auth, db: DB):
    if target_id == auth.user.id:
        raise HTTPException(422, "You cannot block yourself")
    from .chat_service import lock_users
    from .events import realtime

    await lock_users(db, auth.user.id, target_id)
    if await db.get(User, target_id) is None:
        raise HTTPException(404, "User not found")
    await db.execute(insert(Block).values(user_id=auth.user.id, target_id=target_id).on_conflict_do_nothing())
    low, high = sorted([auth.user.id, target_id])
    await db.execute(
        update(Connection).where(Connection.low_id == low, Connection.high_id == high).values(status="closed")
    )
    await realtime(db, target_id, {"type": "connections.updated"})
    await db.commit()


@router.get("/blocks", response_model=list[UUID], tags=["Privacy"])
async def blocks(auth: Auth, db: DB):
    return list(await db.scalars(select(Block.target_id).where(Block.user_id == auth.user.id)))


@router.delete("/blocks/{target_id}", status_code=204, tags=["Privacy"])
async def unblock(target_id: UUID, auth: Auth, db: DB):
    await db.execute(delete(Block).where(Block.user_id == auth.user.id, Block.target_id == target_id))
    await db.commit()


@router.get("/me/export", tags=["Privacy"])
async def export_account(response: Response, auth: Auth, db: DB):
    response.headers["Cache-Control"] = "no-store"
    current = await my_profile(db, auth.user.id)
    feedback_rows = list(await db.scalars(select(Feedback).where(Feedback.user_id == auth.user.id)))
    block_rows = list(await db.scalars(select(Block.target_id).where(Block.user_id == auth.user.id)))
    sent_messages = list(
        await db.scalars(select(Message).where(Message.sender_id == auth.user.id).order_by(Message.created_at))
    )
    reports = list(await db.scalars(select(Report).where(Report.reporter_id == auth.user.id)))
    notification_rows = list(await db.scalars(select(Notification).where(Notification.user_id == auth.user.id)))
    return {
        "sent_messages": [
            {
                "id": item.id,
                "conversation_id": item.conversation_id,
                "sequence": item.sequence,
                "body": item.body,
                "removed": item.removed,
                "created_at": item.created_at,
            }
            for item in sent_messages
        ],
        "reports": [
            {"id": item.id, "reason": item.reason, "details": item.details, "status": item.status} for item in reports
        ],
        "notifications": [
            {"id": item.id, "kind": item.kind, "title": item.title, "read_at": item.read_at}
            for item in notification_rows
        ],
        "account": {"id": auth.user.id, "email": auth.user.email, "created_at": auth.user.created_at},
        "profile": MyProfile.model_validate(current),
        "blocked_user_ids": block_rows,
        "recommendation_feedback": [
            {"target_id": item.target_id, "action": item.action, "updated_at": item.updated_at}
            for item in feedback_rows
        ],
    }


@router.delete("/me", status_code=204, tags=["Privacy"])
async def delete_account(body: DeleteAccount, response: Response, auth: Auth, db: DB):
    if not await verify_password(body.password, auth.user.password_hash):
        raise HTTPException(403, "Password is incorrect")
    await db.delete(auth.user)
    await db.commit()
    clear_cookie(response)
