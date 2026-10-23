"""Optional real HTTP/WebSocket tests. CI starts API and Redis services."""

import asyncio
import json
import os
from uuid import uuid4

import httpx
import pytest
from redis.asyncio import Redis
from websockets.asyncio.client import connect as websocket_connect
from websockets.exceptions import ConnectionClosed, InvalidStatus

from app import redis_client, worker
from tests.helpers import account, bearer
from tests.test_chat import PREFS, connect


async def receive_type(socket, kind):
    for _ in range(20):
        event = json.loads(await asyncio.wait_for(socket.recv(), 5))
        if event["type"] == kind:
            return event
    pytest.fail(f"Did not receive {kind}")


async def live_pair(client, monkeypatch):
    url = os.environ.get("TEST_LIVE_API_URL")
    redis_url = os.environ.get("TEST_REAL_REDIS_URL")
    if not url or not redis_url:
        pytest.skip("Start a migrated API and real Redis; set TEST_LIVE_API_URL and TEST_REAL_REDIS_URL")
    if not redis_url.endswith("/15"):
        pytest.fail("Live tests only reset dedicated disposable Redis DB 15")
    redis = Redis.from_url(redis_url, decode_responses=True)
    monkeypatch.setattr(redis_client, "get_redis", lambda: redis)
    await redis.flushdb()
    return url, redis


async def test_real_socket_ticket_pubsub_message_retry_block_and_logout(client, monkeypatch):
    url, redis = await live_pair(client, monkeypatch)
    headers = {"X-Roleplay-CSRF": "1", "Origin": "http://localhost:5173"}
    async with httpx.AsyncClient(base_url=url, headers=headers, trust_env=False) as api:
        first = await account(api, "socket-first", **PREFS)
        second = await account(api, "socket-second", **PREFS)
        conversation = await connect(api, first, second)
        first_ticket = (await api.post("/v1/ws-ticket", headers=bearer(first[0]))).json()["ticket"]
        second_ticket = (await api.post("/v1/ws-ticket", headers=bearer(second[0]))).json()["ticket"]
        socket_url = url.replace("http://", "ws://") + "/v1/ws"
        async with (
            websocket_connect(socket_url, origin=headers["Origin"], proxy=None) as one,
            websocket_connect(socket_url, origin=headers["Origin"], proxy=None) as two,
        ):
            await one.send(json.dumps({"type": "authenticate", "ticket": first_ticket}))
            await two.send(json.dumps({"type": "authenticate", "ticket": second_ticket}))
            assert (await receive_type(one, "ready"))["user_id"] == first[1]["user_id"]
            await receive_type(two, "ready")
            value = {
                "type": "message.send",
                "conversation_id": conversation,
                "client_message_id": str(uuid4()),
                "body": "Live private message",
            }
            await one.send(json.dumps(value))
            sent = (await receive_type(one, "message.ack"))["message"]
            assert sent["sequence"] == 1
            for _ in range(40):
                if not await worker.process_one():
                    break
            hint = await receive_type(two, "chat.updated")
            assert hint["conversation_id"] == conversation and "Live private message" not in str(hint)
            await one.send(json.dumps(value))
            assert (await receive_type(one, "message.ack"))["message"]["id"] == sent["id"]
            await api.put(f"/v1/blocks/{first[1]['user_id']}", headers=bearer(second[0]))
            await one.send(json.dumps(value | {"client_message_id": str(uuid4())}))
            assert (await receive_type(one, "error"))["status"] == 404
            await api.post("/v1/auth/logout", headers=bearer(first[0]))
            await one.send(json.dumps({"type": "ping"}))
            with pytest.raises(ConnectionClosed) as error:
                await one.recv()
            assert error.value.rcvd.code == 4401
        async with websocket_connect(socket_url, origin=headers["Origin"], proxy=None) as replay:
            await replay.send(json.dumps({"type": "authenticate", "ticket": first_ticket}))
            with pytest.raises(ConnectionClosed) as error:
                await replay.recv()
            assert error.value.rcvd.code == 1008
    await redis.aclose()


async def test_real_socket_rejects_wrong_origin_and_missing_authentication(client, monkeypatch):
    url, redis = await live_pair(client, monkeypatch)
    socket_url = url.replace("http://", "ws://") + "/v1/ws"
    with pytest.raises(InvalidStatus):
        async with websocket_connect(socket_url, origin="https://attacker.example", proxy=None):
            pytest.fail("Wrong origin was accepted")
    async with websocket_connect(socket_url, origin="http://localhost:5173", proxy=None) as socket:
        await socket.send(json.dumps({"type": "message.send", "body": "Unauthenticated"}))
        with pytest.raises(ConnectionClosed) as error:
            await socket.recv()
        assert error.value.rcvd.code == 1008
    await redis.aclose()
