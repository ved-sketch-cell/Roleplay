import logging
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from . import redis_client
from .chat_routes import router as chat_router
from .config import get_settings
from .db import SessionLocal, engine
from .moderation import router as moderation_router
from .recovery import router as recovery_router
from .routes import router
from .sockets import router as socket_router

logger = logging.getLogger("roleplay.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await redis_client.close_redis()
    await engine.dispose()


settings = get_settings()
app = FastAPI(
    title="ROLEPLAY API",
    version="0.2.0",
    lifespan=lifespan,
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Roleplay-CSRF"],
    expose_headers=["X-Request-ID", "Retry-After"],
)
app.include_router(router)
app.include_router(chat_router)
app.include_router(moderation_router)
app.include_router(recovery_router)
app.include_router(socket_router)


@app.middleware("http")
async def request_metadata(request: Request, call_next):
    request_id = str(uuid4())
    if request.headers.get("content-length", "").isdigit() and int(request.headers["content-length"]) > 32768:
        return JSONResponse({"detail": "Request body is too large"}, status_code=413)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    # Pydantic errors can include the submitted password or other private data.
    return JSONResponse(
        {"detail": [{"loc": error["loc"], "msg": error["msg"], "type": error["type"]} for error in exc.errors()]},
        status_code=422,
    )


@app.get("/health/live", tags=["Health"])
async def live():
    return {"status": "ok"}


@app.get("/health/ready", tags=["Health"])
async def ready():
    try:
        async with SessionLocal() as db:
            revision = await db.scalar(text("SELECT version_num FROM alembic_version"))
            if revision != "0002_community":
                return JSONResponse({"status": "not_ready"}, status_code=503)
    except Exception:
        return JSONResponse({"status": "not_ready"}, status_code=503)
    try:
        await redis_client.get_redis().ping()
    except Exception:
        return JSONResponse({"status": "not_ready"}, status_code=503)
    return {"status": "ready"}
