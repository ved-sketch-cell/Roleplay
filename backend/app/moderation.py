from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import or_, select, update

from .chat_service import blocked, lock_users, other_user
from .community_schemas import ModerationInput, ModeratorReport, ReportInput, ReportView
from .events import notification, realtime
from .models import (
    Connection,
    Conversation,
    Message,
    ModerationAction,
    PasswordReset,
    Profile,
    RefreshSession,
    Report,
    User,
)
from .rate_limit import enforce_limit
from .recommendations import ensure_eligible_target, my_profile
from .routes import DB, Auth
from .security import now

router = APIRouter(prefix="/v1", tags=["Moderation"])


def moderator(auth):
    if not auth.user.active or not auth.user.is_moderator:
        raise HTTPException(403, "Moderator access is required")


@router.post("/reports", response_model=ReportView, status_code=201)
async def report(body: ReportInput, auth: Auth, db: DB):
    await enforce_limit(f"report:{auth.user.id}", limit=10, window=3600)
    evidence = None
    if body.message_id:
        message = await db.get(Message, body.message_id)
        if message is None:
            raise HTTPException(404, "Message is unavailable")
        connection = await db.scalar(
            select(Connection)
            .join(Conversation, Conversation.connection_id == Connection.id)
            .where(Conversation.id == message.conversation_id)
        )
        if connection is None:
            raise HTTPException(404, "Message is unavailable")
        other_user(connection, auth.user.id)  # Membership remains required even after a block.
        target_id, evidence = message.sender_id, message.body if not message.removed else None
    else:
        target_id = body.target_user_id
        connection = await db.scalar(
            select(Connection).where(
                or_(Connection.low_id == auth.user.id, Connection.high_id == auth.user.id),
                or_(Connection.low_id == target_id, Connection.high_id == target_id),
            )
        )
        if connection is None and not await blocked(db, auth.user.id, target_id):
            await ensure_eligible_target(db, await my_profile(db, auth.user.id), target_id)
    if target_id == auth.user.id or await db.get(User, target_id) is None:
        raise HTTPException(422, "Choose another person's message or account")
    row = Report(
        reporter_id=auth.user.id,
        reported_id=target_id,
        message_id=body.message_id,
        reason=body.reason,
        details=body.details,
        evidence=evidence,
    )
    db.add(row)
    await db.flush()
    await notification(
        db,
        auth.user.id,
        kind="moderation",
        title="Report received",
        data={"report_id": str(row.id)},
        event_key=f"report:{row.id}",
    )
    await db.commit()
    return row


@router.get("/reports/me", response_model=list[ReportView])
async def my_reports(auth: Auth, db: DB):
    return list(
        await db.scalars(
            select(Report).where(Report.reporter_id == auth.user.id).order_by(Report.created_at.desc()).limit(100)
        )
    )


@router.get("/moderation/reports", response_model=list[ModeratorReport])
async def report_queue(
    auth: Auth,
    db: DB,
    status: Annotated[str, Query(pattern="^(open|resolved|dismissed|all)$")] = "open",
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0, le=10000)] = 0,
):
    moderator(auth)
    query = select(Report)
    if status != "all":
        query = query.where(Report.status == status)
    return list(await db.scalars(query.order_by(Report.created_at.asc(), Report.id.asc()).offset(offset).limit(limit)))


@router.get("/moderation/reports/{report_id}/actions")
async def actions(report_id: UUID, auth: Auth, db: DB):
    moderator(auth)
    return list(
        await db.scalars(
            select(ModerationAction)
            .where(ModerationAction.report_id == report_id)
            .order_by(ModerationAction.created_at)
        )
    )


@router.post("/moderation/reports/{report_id}/actions", response_model=ModeratorReport)
async def act(report_id: UUID, body: ModerationInput, auth: Auth, db: DB):
    moderator(auth)
    await enforce_limit(f"moderation:{auth.user.id}", limit=30)
    row = await db.get(Report, report_id)
    if row is None:
        raise HTTPException(404, "Report is unavailable")
    if auth.user.id in {row.reported_id, row.reporter_id}:
        raise HTTPException(403, "Another moderator must review a case involving you")
    await lock_users(db, auth.user.id, row.reported_id)
    await db.refresh(row, with_for_update=True)
    await db.refresh(auth.user)
    moderator(auth)
    target = await db.get(User, row.reported_id)
    if target is None:
        raise HTTPException(404, "Account is unavailable")
    if body.action == "dismiss_report":
        row.status = "dismissed"
    elif body.action == "remove_message":
        message = await db.get(Message, row.message_id) if row.message_id else None
        if message is None:
            raise HTTPException(422, "This report has no available message to remove")
        message.body, message.removed = "", True
        connection = await db.scalar(
            select(Connection)
            .join(Conversation, Conversation.connection_id == Connection.id)
            .where(Conversation.id == message.conversation_id)
        )
        if connection:
            for user_id in [connection.low_id, connection.high_id]:
                await realtime(
                    db,
                    user_id,
                    {
                        "type": "chat.updated",
                        "conversation_id": str(message.conversation_id),
                        "sequence": message.sequence,
                    },
                )
        row.status = "resolved"
    elif body.action == "suspend_user":
        target.active = False
        profile = await db.get(Profile, target.id)
        if profile:
            profile.discoverable = False
        await db.execute(update(RefreshSession).where(RefreshSession.user_id == target.id).values(revoked_at=now()))
        await db.execute(update(PasswordReset).where(PasswordReset.user_id == target.id).values(used_at=now()))
        row.status = "resolved"
    elif body.action == "restore_user":
        target.active = True
        # Discovery remains off; restoration does not create sessions or consent.
        row.status = "resolved"
    row.resolution = body.action
    db.add(ModerationAction(report_id=row.id, moderator_id=auth.user.id, action=body.action, note=body.note.strip()))
    await notification(
        db,
        row.reporter_id,
        kind="moderation",
        title="Your report was reviewed",
        data={"report_id": str(row.id)},
        event_key=f"review:{row.id}:{now().isoformat()}",
    )
    await db.commit()
    return row
