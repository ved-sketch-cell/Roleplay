from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_moderator: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Profile(Base):
    __tablename__ = "profiles"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(40), nullable=False)
    bio: Mapped[str] = mapped_column(String(280), default="", nullable=False)
    avatar: Mapped[str] = mapped_column(String(16), default="👾", nullable=False)
    discoverable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    share_presence: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    interests: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    goals: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    languages: Mapped[list[str]] = mapped_column(ARRAY(Text), default=lambda: ["english"], nullable=False)
    contact_modes: Mapped[list[str]] = mapped_column(ARRAY(Text), default=lambda: ["text"], nullable=False)
    communication_style: Mapped[str] = mapped_column(String(20), default="flexible", nullable=False)
    interaction_preference: Mapped[str] = mapped_column(String(20), default="flexible", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    __table_args__ = (
        Index("ix_profiles_interests_gin", "interests", postgresql_using="gin"),
        Index("ix_profiles_languages_gin", "languages", postgresql_using="gin"),
        Index("ix_profiles_discoverable", "discoverable"),
        CheckConstraint("cardinality(interests) <= 30", name="ck_interest_limit"),
        CheckConstraint("cardinality(languages) BETWEEN 1 AND 10", name="ck_language_limit"),
        CheckConstraint("cardinality(contact_modes) BETWEEN 1 AND 3", name="ck_contact_modes"),
    )


class RefreshSession(Base):
    __tablename__ = "refresh_sessions"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Block(Base):
    __tablename__ = "blocks"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    target_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        CheckConstraint("user_id <> target_id", name="ck_no_self_block"),
        Index("ix_blocks_target", "target_id"),
    )


class Feedback(Base):
    __tablename__ = "recommendation_feedback"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    target_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    action: Mapped[str] = mapped_column(String(16), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (CheckConstraint("action IN ('dismiss', 'interested')", name="ck_feedback_action"),)


class RateLimitBucket(Base):
    __tablename__ = "rate_limit_buckets"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    attempts: Mapped[int] = mapped_column(default=1, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


class Connection(Base):
    __tablename__ = "connections"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    low_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    high_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    requested_by: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    __table_args__ = (
        UniqueConstraint("low_id", "high_id", name="uq_connection_pair"),
        CheckConstraint("low_id < high_id", name="ck_connection_order"),
        CheckConstraint("requested_by IN (low_id, high_id)", name="ck_request_participant"),
        CheckConstraint("status IN ('pending', 'accepted', 'declined', 'closed')", name="ck_connection_status"),
        Index("ix_connections_low", "low_id"),
        Index("ix_connections_high", "high_id"),
    )


class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    connection_id: Mapped[UUID] = mapped_column(
        ForeignKey("connections.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    last_sequence: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_message_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    sequence: Mapped[int] = mapped_column(BigInteger, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    removed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        UniqueConstraint("conversation_id", "sequence", name="uq_message_sequence"),
        UniqueConstraint("conversation_id", "sender_id", "client_message_id", name="uq_message_retry"),
        CheckConstraint("sequence > 0", name="ck_message_sequence"),
        CheckConstraint("length(body) <= 3000", name="ck_message_length"),
    )


class ReadReceipt(Base):
    __tablename__ = "read_receipts"
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    last_read_sequence: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    in_app: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    messages: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    event_key: Mapped[str] = mapped_column(String(120), nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint("user_id", "event_key", name="uq_notification_event"),)


class PasswordReset(Base):
    __tablename__ = "password_resets"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Outbox(Base):
    __tablename__ = "outbox"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    reset_id: Mapped[UUID | None] = mapped_column(ForeignKey("password_resets.id", ondelete="CASCADE"))
    purpose: Mapped[str] = mapped_column(String(32), nullable=False)
    event: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    encrypted_payload: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    available_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    lease_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    error_code: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        CheckConstraint("purpose IN ('realtime', 'email', 'recovery_request')", name="ck_outbox_purpose"),
        CheckConstraint("status IN ('pending', 'working', 'sent', 'dead')", name="ck_outbox_status"),
        Index("ix_outbox_pending", "status", "available_at"),
    )


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    reporter_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message_id: Mapped[UUID | None] = mapped_column(ForeignKey("messages.id", ondelete="SET NULL"))
    reason: Mapped[str] = mapped_column(String(24), nullable=False)
    details: Mapped[str] = mapped_column(String(500), nullable=False)
    evidence: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="open", nullable=False, index=True)
    resolution: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    __table_args__ = (CheckConstraint("status IN ('open', 'resolved', 'dismissed')", name="ck_report_status"),)


class ModerationAction(Base):
    __tablename__ = "moderation_actions"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    report_id: Mapped[UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    moderator_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    note: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
