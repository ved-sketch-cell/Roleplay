from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import and_, exists, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .community_schemas import MessageSend, MessageView
from .events import notification, realtime
from .models import Block, Connection, Conversation, Message, Profile, User


def other_user(connection: Connection, user_id: UUID) -> UUID:
    if user_id not in {connection.low_id, connection.high_id}:
        raise HTTPException(404, "Conversation is unavailable")
    return connection.high_id if user_id == connection.low_id else connection.low_id


async def lock_users(db: AsyncSession, *ids: UUID) -> None:
    # All pair mutations acquire the same order, serializing sends vs blocks.
    found = list(await db.scalars(select(User.id).where(User.id.in_(set(ids))).order_by(User.id).with_for_update()))
    if len(found) != len(set(ids)):
        raise HTTPException(404, "Connection is unavailable")


async def blocked(db: AsyncSession, first: UUID, second: UUID) -> bool:
    return bool(
        await db.scalar(
            select(
                exists().where(
                    or_(
                        and_(Block.user_id == first, Block.target_id == second),
                        and_(Block.user_id == second, Block.target_id == first),
                    )
                )
            )
        )
    )


async def permitted_connection(db: AsyncSession, user_id: UUID, connection: Connection) -> UUID:
    peer = other_user(connection, user_id)
    active_count = len(
        list(await db.scalars(select(User.id).where(User.id.in_([user_id, peer]), User.active.is_(True))))
    )
    if connection.status != "accepted" or active_count != 2 or await blocked(db, user_id, peer):
        raise HTTPException(404, "Conversation is unavailable")
    return peer


async def conversation_access(db: AsyncSession, user_id: UUID, conversation_id: UUID, *, lock=False):
    row = (
        await db.execute(
            select(Conversation, Connection)
            .join(Connection, Conversation.connection_id == Connection.id)
            .where(Conversation.id == conversation_id)
        )
    ).first()
    if row is None:
        raise HTTPException(404, "Conversation is unavailable")
    conversation, connection = row
    peer = other_user(connection, user_id)
    if lock:
        await lock_users(db, user_id, peer)
        await db.refresh(connection)
        await db.refresh(conversation, with_for_update=True)
    await permitted_connection(db, user_id, connection)
    return conversation, connection, peer


async def send_message(db: AsyncSession, user_id: UUID, body: MessageSend) -> MessageView:
    conversation, _, peer = await conversation_access(db, user_id, body.conversation_id, lock=True)
    previous = await db.scalar(
        select(Message).where(
            Message.conversation_id == conversation.id,
            Message.sender_id == user_id,
            Message.client_message_id == body.client_message_id,
        )
    )
    if previous:
        if not previous.removed and previous.body != body.body:
            raise HTTPException(409, "This message identifier was already used")
        return MessageView.model_validate(previous)
    sequence = await db.scalar(
        update(Conversation)
        .where(Conversation.id == conversation.id)
        .values(last_sequence=Conversation.last_sequence + 1)
        .returning(Conversation.last_sequence)
    )
    message = Message(
        conversation_id=conversation.id,
        sender_id=user_id,
        client_message_id=body.client_message_id,
        sequence=sequence,
        body=body.body,
    )
    db.add(message)
    await db.flush()
    hint = {"type": "chat.updated", "conversation_id": str(conversation.id), "sequence": sequence}
    await realtime(db, user_id, hint)
    await realtime(db, peer, hint)
    await notification(
        db,
        peer,
        kind="message",
        title="New message",
        data={"conversation_id": str(conversation.id)},
        event_key=f"message:{message.id}",
        actor_id=user_id,
    )
    # Commit message and durable events together. The socket only acknowledges
    # success after this commit; retries carry the same client_message_id.
    await db.commit()
    return MessageView.model_validate(message)


async def public_peer(db: AsyncSession, user_id: UUID):
    profile = await db.get(Profile, user_id)
    if profile is None:
        raise HTTPException(404, "Connection is unavailable")
    return {"user_id": user_id, "display_name": profile.display_name, "avatar": profile.avatar}
