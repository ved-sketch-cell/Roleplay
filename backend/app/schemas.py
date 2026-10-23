import unicodedata
from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Communication = Literal["direct", "empathetic", "analytical", "casual", "flexible"]
Interaction = Literal["one-on-one", "small-group", "large-group", "flexible"]
ContactMode = Literal["text", "audio", "video"]
Tag = Annotated[str, Field(min_length=1, max_length=60)]
Password = Annotated[str, Field(min_length=12, max_length=128)]


def normalize_tags(value: list[str]) -> list[str]:
    tags = [" ".join(unicodedata.normalize("NFKC", tag).strip().casefold().split()) for tag in value]
    if any(not tag or len(tag) > 60 or any(ord(c) < 32 for c in tag) for tag in tags):
        raise ValueError("Use non-empty preference labels of 1–60 characters")
    return list(dict.fromkeys(tags))


class Schema(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)


class Register(Schema):
    email: EmailStr
    password: Password
    display_name: str = Field(min_length=2, max_length=40)

    @field_validator("display_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2 or any(ord(c) < 32 for c in value):
            raise ValueError("Choose an alias of 2–40 characters")
        return value


class Login(Schema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenPair(Schema):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class ProfileUpdate(Schema):
    display_name: str | None = Field(default=None, min_length=2, max_length=40)
    bio: str | None = Field(default=None, max_length=280)
    avatar: str | None = Field(default=None, min_length=1, max_length=16)
    discoverable: bool | None = None
    share_presence: bool | None = None
    interests: list[Tag] | None = Field(default=None, max_length=30)
    goals: list[Tag] | None = Field(default=None, max_length=10)
    languages: list[Tag] | None = Field(default=None, min_length=1, max_length=10)
    contact_modes: list[ContactMode] | None = Field(default=None, min_length=1, max_length=3)
    communication_style: Communication | None = None
    interaction_preference: Interaction | None = None

    @field_validator("interests", "goals", "languages")
    @classmethod
    def tags(cls, value):
        return normalize_tags(value) if value is not None else value

    @field_validator("display_name")
    @classmethod
    def clean_name(cls, value):
        return Register.clean_name(value) if value is not None else None

    @field_validator("bio", "avatar")
    @classmethod
    def clean_text(cls, value):
        if value is not None:
            value = value.strip()
            if any(ord(c) < 32 and c not in "\n\t" for c in value):
                raise ValueError("Control characters are not allowed")
        return value


class MyProfile(Schema):
    user_id: UUID
    display_name: str
    bio: str
    avatar: str
    discoverable: bool
    share_presence: bool
    interests: list[str]
    goals: list[str]
    languages: list[str]
    contact_modes: list[ContactMode]
    communication_style: Communication
    interaction_preference: Interaction
    updated_at: datetime


class RecommendationFilters(Schema):
    limit: int = Field(default=10, ge=1, le=20, strict=True)
    min_score: float = Field(default=0, ge=0, le=100)
    interests: list[Tag] | None = Field(default=None, min_length=1, max_length=5)

    @field_validator("interests")
    @classmethod
    def tags(cls, value):
        return normalize_tags(value) if value is not None else None


class RecommendationQuery(RecommendationFilters):
    # URL query parameters arrive as strings; the JSON tool remains strict.
    limit: int = Field(default=10, ge=1, le=20)


class UserMatch(Schema):
    user_id: UUID
    display_name: str
    bio: str
    avatar: str
    similarity_score: float
    shared_interests: list[str]
    shared_goals: list[str]
    shared_languages: list[str]
    compatible_contact_modes: list[str]
    reasons: list[str]


class Recommendations(Schema):
    matches: list[UserMatch]
    algorithm_version: str = "preferences-v1"
    score_label: str = "Declared preference similarity; not a psychological assessment"
    message: str | None = None


class FeedbackInput(Schema):
    target_id: UUID
    action: Literal["dismiss", "interested"]


class DeleteAccount(Schema):
    password: str = Field(min_length=1, max_length=128)


class AIRequest(Schema):
    prompt: str = Field(min_length=1, max_length=500)
    share_preferences_with_ai: bool = False


class AIRecommendations(Recommendations):
    interpreted_filters: RecommendationFilters
