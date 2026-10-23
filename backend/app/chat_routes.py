import secrets
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from redis.exceptions import RedisError
from sqlalchemy import and_, delete, exists, func, or_, select
from sqlalchemy.dialects.postgresql import insert

from . import redis_client
from .chat_service import blocked, conversation_access, lock_users, other_user, public_peer, send_message
from .community_schemas import (
    ConnectionDecision,
    ConnectionRequest,
    ConnectionView,
    ConversationView,
    MessagePage,
    MessageSend,
    MessageView,
    NotificationSettings,
    NotificationView,
    ReadInput,
)
from .events import notification, realtime
from .models import (
    Block,
    Connection,
    Conversation,
    Feedback,
    Message,
    Notification,
    NotificationPreference,
    ReadReceipt,
    User,
)
from .rate_limit import enforce_limit
from .recommendations import ensure_eligible_target, my_profile
from .routes import DB, Auth
from .security import now, token_hash

router = APIRouter(prefix="/v1", tags=["Chat and notifications"])


async def connection_view(db, connection, user_id):
    peer = other_user(connection, user_id)
    conversation_id = await db.scalar(select(Conversation.id).where(Conversation.connection_id == connection.id))
    return ConnectionView(
        id=connection.id,
        status=connection.status,
        requested_by=connection.requested_by,
        peer=await public_peer(db, peer),
        conversation_id=conversation_id if connection.status == "accepted" else None,
        created_at=connection.created_at,
    )


@router.get("/me/capabilities")
async def capabilities(auth: Auth):
    return {"is_moderator": auth.user.is_moderator}


@router.post("/connections", response_model=ConnectionView, status_code=201)
async def request_connection(body: ConnectionRequest, auth: Auth, db: DB):
    await enforce_limit(f"connection:{auth.user.id}", limit=10, window=300)
    if body.target_id == auth.user.id:
        raise HTTPException(422, "Choose another person")
    await lock_users(db, auth.user.id, body.target_id)
    viewer = await my_profile(db, auth.user.id)
    await ensure_eligible_target(db, viewer, body.target_id)
    target = await my_profile(db, body.target_id)
    if "text" not in viewer.contact_modes or "text" not in target.contact_modes:
        raise HTTPException(422, "Both people must choose text as a conversation preference")
    low, high = sorted([auth.user.id, body.target_id])
    current = await db.scalar(
        select(Connection).where(Connection.low_id == low, Connection.high_id == high).with_for_update()
    )
    if current and current.status == "accepted":
        return await connection_view(db, current, auth.user.id)
    if current and current.status == "pending":
        if current.requested_by != auth.user.id:
            raise HTTPException(409, "This person already requested a connection. Review it in Messages.")
        return await connection_view(db, current, auth.user.id)
    if current is None:
        current = Connection(low_id=low, high_id=high, requested_by=auth.user.id)
        db.add(current)
    else:
        current.status, current.requested_by, current.created_at = "pending", auth.user.id, now()
    await db.flush()
    await notification(
        db,
        body.target_id,
        kind="connection_requested",
        title="New connection request",
        data={"connection_id": str(current.id)},
        event_key=f"connection:{current.id}:{current.created_at.isoformat()}",
        actor_id=auth.user.id,
    )
    await realtime(db, body.target_id, {"type": "connections.updated"})
    await db.commit()
    return await connection_view(db, current, auth.user.id)


@router.get("/connections", response_model=list[ConnectionView])
async def connections(auth: Auth, db: DB):
    rows = list(
        await db.scalars(
            select(Connection)
            .where(
                or_(Connection.low_id == auth.user.id, Connection.high_id == auth.user.id),
                Connection.status.in_(["pending", "accepted"]),
            )
            .order_by(Connection.updated_at.desc())
            .limit(100)
        )
    )
    output = []
    for row in rows:
        peer = other_user(row, auth.user.id)
        if not await blocked(db, auth.user.id, peer) and await db.scalar(select(User.active).where(User.id == peer)):
            output.append(await connection_view(db, row, auth.user.id))
    return output


@router.post("/connections/{connection_id}/decision", response_model=ConnectionView)
async def decide(connection_id: UUID, body: ConnectionDecision, auth: Auth, db: DB):
    current = await db.get(Connection, connection_id)
    if current is None:
        raise HTTPException(404, "Connection is unavailable")
    peer = other_user(current, auth.user.id)
    await lock_users(db, auth.user.id, peer)
    await db.refresh(current, with_for_update=True)
    if (
        current.status != "pending"
        or await blocked(db, auth.user.id, peer)
        or not await db.scalar(select(User.active).where(User.id == peer))
    ):
        raise HTTPException(409, "This request is no longer available")
    sender = current.requested_by == auth.user.id
    if body.action == "cancel" and not sender or body.action != "cancel" and sender:
        raise HTTPException(403, "Only the recipient can accept or decline this request")
    if body.action == "accept":
        current.status = "accepted"
        existing = await db.scalar(select(Conversation).where(Conversation.connection_id == current.id))
        if existing is None:
            existing = Conversation(connection_id=current.id)
            db.add(existing)
            await db.flush()
        await notification(
            db,
            peer,
            kind="connection_accepted",
            title="Connection accepted",
            data={"conversation_id": str(existing.id)},
            event_key=f"accepted:{current.id}:{current.created_at.isoformat()}",
            actor_id=auth.user.id,
        )
    else:
        current.status = "declined" if body.action == "decline" else "closed"
        if body.action == "decline":
            await db.execute(
                insert(Feedback)
                .values(user_id=auth.user.id, target_id=peer, action="dismiss")
                .on_conflict_do_update(
                    index_elements=[Feedback.user_id, Feedback.target_id],
                    set_={"action": "dismiss", "updated_at": now()},
                )
            )
    await realtime(db, peer, {"type": "connections.updated"})
    await db.commit()
    return await connection_view(db, current, auth.user.id)


@router.get("/conversations", response_model=list[ConversationView])
async def conversations(auth: Auth, db: DB):
    rows = (
        await db.execute(
            select(Conversation, Connection)
            .join(Connection, Conversation.connection_id == Connection.id)
            .where(
                Connection.status == "accepted",
                or_(Connection.low_id == auth.user.id, Connection.high_id == auth.user.id),
            )
            .order_by(Conversation.updated_at.desc())
            .limit(100)
        )
    ).all()
    output = []
    for conversation, connection in rows:
        peer = other_user(connection, auth.user.id)
        if await blocked(db, auth.user.id, peer) or not await db.scalar(select(User.active).where(User.id == peer)):
            continue
        profile = await my_profile(db, peer)
        mine = await db.get(ReadReceipt, (conversation.id, auth.user.id))
        theirs = await db.get(ReadReceipt, (conversation.id, peer))
        output.append(
            ConversationView(
                id=conversation.id,
                peer=await public_peer(db, peer),
                last_sequence=conversation.last_sequence,
                last_read_sequence=mine.last_read_sequence if mine else 0,
                peer_read_sequence=theirs.last_read_sequence if theirs else 0,
                presence=await redis_client.presence(peer, profile.share_presence),
            )
        )
    return output


@router.get("/conversations/{conversation_id}/messages", response_model=MessagePage)
async def messages(
    conversation_id: UUID,
    auth: Auth,
    db: DB,
    after: Annotated[int | None, Query(ge=0)] = None,
    before: Annotated[int | None, Query(ge=1)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    if after is not None and before is not None:
        raise HTTPException(422, "Choose one message cursor")
    conversation, _, _ = await conversation_access(db, auth.user.id, conversation_id)
    query = select(Message).where(Message.conversation_id == conversation_id)
    if after is not None:
        query = query.where(Message.sequence > after).order_by(Message.sequence.asc())
    else:
        if before is not None:
            query = query.where(Message.sequence < before)
        query = query.order_by(Message.sequence.desc())
    rows = list(await db.scalars(query.limit(limit + 1)))
    more, rows = len(rows) > limit, rows[:limit]
    return MessagePage(
        messages=[MessageView.model_validate(item) for item in sorted(rows, key=lambda item: item.sequence)],
        has_more=more,
        latest_sequence=conversation.last_sequence,
    )


@router.post("/messages", response_model=MessageView, status_code=201)
async def post_message(body: MessageSend, auth: Auth, db: DB):
    await enforce_limit(f"chat:{auth.user.id}", limit=60)
    return await send_message(db, auth.user.id, body)


@router.put("/conversations/{conversation_id}/read", status_code=204)
async def read_messages(conversation_id: UUID, body: ReadInput, auth: Auth, db: DB):
    conversation, _, peer = await conversation_access(db, auth.user.id, conversation_id, lock=True)
    if body.sequence > conversation.last_sequence:
        raise HTTPException(422, "Read position exceeds the conversation")
    statement = insert(ReadReceipt).values(
        conversation_id=conversation_id, user_id=auth.user.id, last_read_sequence=body.sequence
    )
    await db.execute(
        statement.on_conflict_do_update(
            index_elements=[ReadReceipt.conversation_id, ReadReceipt.user_id],
            set_={
                "last_read_sequence": func.greatest(ReadReceipt.last_read_sequence, body.sequence),
                "updated_at": now(),
            },
        )
    )
    await realtime(db, peer, {"type": "chat.updated", "conversation_id": str(conversation_id)})
    await db.commit()


@router.delete("/messages/{message_id}", status_code=204)
async def retract(message_id: UUID, auth: Auth, db: DB):
    message = await db.get(Message, message_id)
    if message is None or message.sender_id != auth.user.id:
        raise HTTPException(404, "Message is unavailable")
    _, _, peer = await conversation_access(db, auth.user.id, message.conversation_id, lock=True)
    message.body, message.removed = "", True
    for user_id in [auth.user.id, peer]:
        await realtime(
            db,
            user_id,
            {"type": "chat.updated", "conversation_id": str(message.conversation_id), "sequence": message.sequence},
        )
    await db.commit()


@router.post("/ws-ticket")
async def ticket(auth: Auth):
    await enforce_limit(f"ws-ticket:{auth.user.id}", limit=30)
    raw = secrets.token_urlsafe(32)
    import json

    try:
        await redis_client.get_redis().set(
            f"roleplay:ticket:{token_hash(raw)}",
            json.dumps({"user_id": str(auth.user.id), "session_id": str(auth.session_id)}),
            ex=30,
            nx=True,
        )
    except RedisError:
        raise HTTPException(503, "Live connection is temporarily unavailable") from None
    return {"ticket": raw, "expires_in": 30}


def notification_visibility(user_id):
    return ~exists(
        select(Block.user_id).where(
            or_(
                and_(Block.user_id == user_id, Block.target_id == Notification.actor_id),
                and_(Block.target_id == user_id, Block.user_id == Notification.actor_id),
            )
        )
    )


@router.get("/notifications", response_model=list[NotificationView])
async def notifications(
    auth: Auth, db: DB, before: Annotated[UUID | None, Query()] = None, limit: Annotated[int, Query(ge=1, le=100)] = 50
):
    preference = await db.get(NotificationPreference, auth.user.id)
    if preference and not preference.in_app:
        return []
    query = select(Notification).where(Notification.user_id == auth.user.id, notification_visibility(auth.user.id))
    if before:
        previous = await db.get(Notification, before)
        if previous is None or previous.user_id != auth.user.id:
            raise HTTPException(404, "Notification is unavailable")
        query = query.where(
            or_(
                Notification.created_at < previous.created_at,
                and_(Notification.created_at == previous.created_at, Notification.id < previous.id),
            )
        )
    return list(await db.scalars(query.order_by(Notification.created_at.desc(), Notification.id.desc()).limit(limit)))


@router.put("/notifications/{notification_id}/read", status_code=204)
async def read_notification(notification_id: UUID, auth: Auth, db: DB):
    row = await db.scalar(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == auth.user.id)
    )
    if row is None:
        raise HTTPException(404, "Notification is unavailable")
    row.read_at = row.read_at or now()
    await db.commit()


@router.delete("/notifications/{notification_id}", status_code=204)
async def delete_notification(notification_id: UUID, auth: Auth, db: DB):
    await db.execute(
        delete(Notification).where(Notification.id == notification_id, Notification.user_id == auth.user.id)
    )
    await db.commit()


@router.get("/me/notification-settings", response_model=NotificationSettings)
async def notification_settings(auth: Auth, db: DB):
    return await db.get(NotificationPreference, auth.user.id) or NotificationSettings()


@router.put("/me/notification-settings", response_model=NotificationSettings)
async def change_notification_settings(body: NotificationSettings, auth: Auth, db: DB):
    await db.execute(
        insert(NotificationPreference)
        .values(user_id=auth.user.id, **body.model_dump())
        .on_conflict_do_update(index_elements=[NotificationPreference.user_id], set_=body.model_dump())
    )
    await db.commit()
    return body
