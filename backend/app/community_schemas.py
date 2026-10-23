from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import EmailStr, Field, field_validator, model_validator

from .schemas import Password, Schema


class ConnectionRequest(Schema):
    target_id: UUID


class ConnectionDecision(Schema):
    action: Literal["accept", "decline", "cancel"]


class Peer(Schema):
    user_id: UUID
    display_name: str
    avatar: str


class ConnectionView(Schema):
    id: UUID
    status: str
    requested_by: UUID
    peer: Peer
    conversation_id: UUID | None = None
    created_at: datetime


class ConversationView(Schema):
    id: UUID
    peer: Peer
    last_sequence: int
    last_read_sequence: int
    peer_read_sequence: int
    presence: Literal["online", "offline", "hidden", "unknown"]


class MessageSend(Schema):
    conversation_id: UUID
    client_message_id: UUID
    body: str = Field(min_length=1, max_length=3000)

    @field_validator("body")
    @classmethod
    def clean_message(cls, value):
        value = value.strip()
        if not value or any(ord(char) < 32 and char not in "\n\t" for char in value):
            raise ValueError("Write a non-empty message without control characters")
        return value


class MessageView(Schema):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    client_message_id: UUID
    sequence: int
    body: str
    removed: bool
    created_at: datetime


class MessagePage(Schema):
    messages: list[MessageView]
    has_more: bool
    latest_sequence: int


class ReadInput(Schema):
    sequence: int = Field(ge=0, strict=True)


class NotificationView(Schema):
    id: UUID
    kind: str
    title: str
    data: dict
    read_at: datetime | None
    created_at: datetime


class NotificationSettings(Schema):
    in_app: bool = True
    messages: bool = True
    email: bool = False


class RecoveryRequest(Schema):
    email: EmailStr


class PasswordResetInput(Schema):
    token: str = Field(min_length=20, max_length=128)
    password: Password
    confirm_password: Password

    @model_validator(mode="after")
    def confirmation(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


ReportReason = Literal["harassment", "hate", "spam", "impersonation", "safety", "other"]


class ReportInput(Schema):
    target_user_id: UUID | None = None
    message_id: UUID | None = None
    reason: ReportReason
    details: str = Field(default="", max_length=500)

    @model_validator(mode="after")
    def one_target(self):
        if (self.target_user_id is None) == (self.message_id is None):
            raise ValueError("Choose one user or one message to report")
        return self


class ReportView(Schema):
    id: UUID
    reason: str
    details: str
    status: str
    resolution: str | None
    created_at: datetime


class ModeratorReport(ReportView):
    reporter_id: UUID
    reported_id: UUID
    message_id: UUID | None
    evidence: str | None


class ModerationInput(Schema):
    action: Literal["dismiss_report", "remove_message", "suspend_user", "restore_user"]
    note: str = Field(min_length=3, max_length=500)
