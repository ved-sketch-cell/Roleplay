from functools import lru_cache
from typing import Literal

from pydantic import EmailStr, Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", hide_input_in_errors=True)
    environment: Literal["development", "test", "production"] = "development"
    database_url: str
    jwt_secret: SecretStr
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8080"]
    cookie_secure: bool = False
    openai_api_key: SecretStr | None = None
    openai_model: str = ""
    ai_timeout_seconds: float = 20
    rate_limits_enabled: bool = True
    redis_url: str = "redis://127.0.0.1:6379/0"
    outbox_encryption_key: SecretStr | None = None
    public_web_url: str = "http://localhost:8080"
    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_starttls: bool = True
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_from: EmailStr = "noreply@example.com"
    reset_token_minutes: int = Field(default=20, ge=5, le=60)
    worker_poll_seconds: float = Field(default=1, ge=0.1, le=30)
    presence_ttl_seconds: int = Field(default=60, ge=30, le=120)

    @field_validator("outbox_encryption_key")
    @classmethod
    def encryption_key(cls, value):
        if value and value.get_secret_value():
            from cryptography.fernet import Fernet

            Fernet(value.get_secret_value().encode())
            return value
        return None

    @field_validator("public_web_url")
    @classmethod
    def trusted_web_origin(cls, value):
        from urllib.parse import urlsplit

        parts = urlsplit(value)
        if (
            parts.scheme not in {"http", "https"}
            or not parts.netloc
            or parts.username
            or parts.password
            or parts.query
            or parts.fragment
            or parts.path not in {"", "/"}
        ):
            raise ValueError("PUBLIC_WEB_URL must be an HTTP(S) origin, without a path or credentials")
        return value.rstrip("/")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                import json

                return json.loads(value)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def postgres_only(cls, value: str) -> str:
        if value.startswith("postgres://"):
            value = "postgresql+psycopg://" + value[len("postgres://") :]
        elif value.startswith("postgresql://") and not value.startswith("postgresql+"):
            value = "postgresql+psycopg://" + value[len("postgresql://") :]
        if not value.startswith("postgresql+psycopg://"):
            raise ValueError("DATABASE_URL must use postgresql+psycopg://")
        return value

    @field_validator("jwt_secret")
    @classmethod
    def secret_strength(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 characters")
        return value

    @model_validator(mode="after")
    def production_settings(self):
        if self.environment == "production":
            if not self.cookie_secure or not self.rate_limits_enabled:
                raise ValueError("Production requires secure cookies and rate limits")
            if not self.cors_origins or any(not origin.startswith("https://") for origin in self.cors_origins):
                raise ValueError("Production CORS origins must be explicit HTTPS origins")
            if not self.outbox_encryption_key or not self.public_web_url.startswith("https://"):
                raise ValueError("Production requires outbox encryption and an HTTPS public web origin")
            if self.smtp_host and not self.smtp_starttls:
                raise ValueError("Production SMTP requires STARTTLS")
        if "*" in self.cors_origins:
            raise ValueError("Wildcard CORS is not supported with sessions")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
