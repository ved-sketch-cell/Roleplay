import time
from uuid import UUID

from redis.asyncio import Redis
from redis.exceptions import RedisError

from .config import get_settings

_client: Redis | None = None


def get_redis() -> Redis:
    global _client
    if _client is None:
        _client = Redis.from_url(
            get_settings().redis_url,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=5,
            health_check_interval=30,
        )
    return _client


async def close_redis():
    global _client
    if _client:
        await _client.aclose()
        _client = None


async def touch_presence(user_id: UUID, connection_id: str):
    timestamp = time.time()
    ttl = get_settings().presence_ttl_seconds
    key = f"roleplay:presence:{user_id}"
    async with get_redis().pipeline(transaction=True) as pipe:
        pipe.zremrangebyscore(key, "-inf", timestamp)
        pipe.zadd(key, {connection_id: timestamp + ttl})
        pipe.expire(key, ttl + 5)
        await pipe.execute()


async def leave_presence(user_id: UUID, connection_id: str):
    try:
        await get_redis().zrem(f"roleplay:presence:{user_id}", connection_id)
    except RedisError:
        pass  # TTL still removes stale connections after a process/network crash.


async def presence(user_id: UUID, shared: bool) -> str:
    if not shared:
        return "hidden"
    try:
        key = f"roleplay:presence:{user_id}"
        async with get_redis().pipeline(transaction=True) as pipe:
            pipe.zremrangebyscore(key, "-inf", time.time())
            pipe.zcard(key)
            results = await pipe.execute()
        return "online" if results[-1] else "offline"
    except RedisError:
        return "unknown"
