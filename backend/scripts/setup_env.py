"""Create private local Docker secrets, without overwriting existing settings."""

import argparse
import base64
import os
import secrets
from pathlib import Path

root = Path(__file__).resolve().parents[2]
target = root / ".env"
values = f"""POSTGRES_DB=roleplay
POSTGRES_USER=roleplay
POSTGRES_PASSWORD={secrets.token_urlsafe(36)}
JWT_SECRET={secrets.token_urlsafe(48)}
ENVIRONMENT=development
COOKIE_SECURE=false
CORS_ORIGINS=["http://localhost:5173","http://localhost:8080"]
OPENAI_API_KEY=
OPENAI_MODEL=
OUTBOX_ENCRYPTION_KEY={base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()}
PUBLIC_WEB_URL=http://localhost:8080
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_STARTTLS=false
SMTP_FROM=noreply@example.com
BACKUP_AGE_RECIPIENT=
BACKUP_RETENTION_DAYS=14
"""
parser = argparse.ArgumentParser()
parser.add_argument("--upgrade", action="store_true")
args = parser.parse_args()
if args.upgrade and target.exists():
    existing = {
        line.split("=", 1)[0].strip()
        for line in target.read_text().splitlines()
        if "=" in line and not line.lstrip().startswith("#")
    }
    additions = [line for line in values.splitlines() if line.split("=", 1)[0] not in existing]
    with target.open("a") as stream:
        stream.write("\n" + "\n".join(additions) + "\n")
    os.chmod(target, 0o600)
    print("Added missing settings; existing secrets and values were preserved.")
    raise SystemExit(0)
try:
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
except FileExistsError:
    raise SystemExit(".env already exists; existing settings were preserved.") from None
with os.fdopen(fd, "w") as stream:
    stream.write(values)
print("Created .env with private local secrets. Next: docker compose up --build")
