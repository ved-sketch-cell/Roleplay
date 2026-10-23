import asyncio
import json
import time
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from redis.exceptions import RedisError

from . import redis_client
from .chat_service import send_message
from .community_schemas import MessageSend
from .config import get_settings
from .db import SessionLocal
from .rate_limit import enforce_limit
from .security import lookup_session, token_hash

router = APIRouter()


@router.websocket("/v1/ws")
async def websocket_chat(socket: WebSocket):
    if socket.headers.get("origin") not in get_settings().cors_origins:
        await socket.close(code=1008)
        return
    await socket.accept()
    user_id = None
    connection_id = str(uuid4())
    tasks = []
    send_lock = asyncio.Lock()

    async def send(value):
        async with send_lock:
            await socket.send_json(value)

    try:
        text = await asyncio.wait_for(socket.receive_text(), 5)
        if len(text.encode()) > 1024:
            raise ValueError("Invalid authentication frame")
        frame = json.loads(text)
        if frame.get("type") != "authenticate" or not isinstance(frame.get("ticket"), str):
            raise ValueError("Authentication is required")
        raw = await redis_client.get_redis().getdel(f"roleplay:ticket:{token_hash(frame['ticket'])}")
        if raw is None:
            raise ValueError("Ticket is unavailable")
        identity = json.loads(raw)
        user_id, session_id = UUID(identity["user_id"]), UUID(identity["session_id"])
        started = time.monotonic()

        async def authorize():
            if time.monotonic() - started >= 900:
                raise HTTPException(401, "Reconnect to renew the session")
            async with SessionLocal() as db:
                return await lookup_session(db, user_id, session_id)

        await authorize()
        await redis_client.touch_presence(user_id, connection_id)
        subscribed = asyncio.Event()

        async def receive_loop():
            while True:
                text = await asyncio.wait_for(socket.receive_text(), 35)
                await authorize()
                await enforce_limit(f"ws-frames:{user_id}", limit=120)
                if len(text.encode()) > 16384:
                    raise ValueError("Message frame is too large")
                frame = json.loads(text)
                if frame.get("type") == "ping":
                    await redis_client.touch_presence(user_id, connection_id)
                    await send({"type": "pong"})
                elif frame.get("type") == "message.send":
                    try:
                        body = MessageSend.model_validate({key: value for key, value in frame.items() if key != "type"})
                        await enforce_limit(f"chat:{user_id}", limit=60)
                        async with SessionLocal() as db:
                            result = await send_message(db, user_id, body)
                        await send({"type": "message.ack", "message": result.model_dump(mode="json")})
                    except (HTTPException, ValidationError) as error:
                        await send(
                            {
                                "type": "error",
                                "client_message_id": frame.get("client_message_id"),
                                "status": error.status_code if isinstance(error, HTTPException) else 422,
                                "message": error.detail
                                if isinstance(error, HTTPException)
                                else "Message format is invalid",
                            }
                        )
                else:
                    raise ValueError("Unsupported socket frame")

        async def relay_loop():
            async with redis_client.get_redis().pubsub() as subscription:
                await subscription.subscribe(f"roleplay:events:{user_id}")
                subscribed.set()
                while True:
                    event = await subscription.get_message(ignore_subscribe_messages=True, timeout=1)
                    if event:
                        await authorize()
                        # Events are hints, never private message bodies. REST
                        # re-checks conversation access before returning content.
                        await send(json.loads(event["data"]))

        tasks = [asyncio.create_task(receive_loop()), asyncio.create_task(relay_loop())]
        await asyncio.wait_for(subscribed.wait(), 5)
        await send({"type": "ready", "user_id": str(user_id), "heartbeat_seconds": 20})
        done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            task.result()
    except WebSocketDisconnect:
        pass
    except HTTPException:
        await socket.close(code=4401)
    except RedisError:
        await socket.close(code=1013)
    except (ValueError, KeyError, TypeError, asyncio.TimeoutError):
        await socket.close(code=1008)
    finally:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        if user_id is not None:
            await redis_client.leave_presence(user_id, connection_id)
