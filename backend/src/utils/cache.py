import json
from typing import Any

from src.config.redis import get_redis
from src.utils.logger import logger

# Prefiks za sve cache kljuceve
CACHE_PREFIX = "fintracker:"
# Default TTL: 5 minuta
DEFAULT_TTL = 300


async def cache_get(key: str) -> Any | None:
    """Čita vrednost iz keša. Vraća None ako ne postoji."""
    redis = get_redis()
    full_key = f"{CACHE_PREFIX}{key}"
    data = await redis.get(full_key)
    if data:
        logger.debug(f"Cache HIT: {full_key}")
        return json.loads(data)
    logger.debug(f"Cache MISS: {full_key}")
    return None


async def cache_set(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """Upisuje vrednost u keš sa TTL-om (sekunde)."""
    redis = get_redis()
    full_key = f"{CACHE_PREFIX}{key}"
    await redis.set(full_key, json.dumps(value, default=str), ex=ttl)
    logger.debug(f"Cache SET: {full_key} (TTL: {ttl}s)")


async def cache_delete(pattern: str) -> int:
    """Briše sve ključeve koji odgovaraju patternu. Vraća broj obrisanih."""
    redis = get_redis()
    full_pattern = f"{CACHE_PREFIX}{pattern}"
    keys = []
    async for key in redis.scan_iter(match=full_pattern):
        keys.append(key)
    if keys:
        deleted = await redis.delete(*keys)
        logger.debug(f"Cache DELETE: {full_pattern} ({deleted} keys)")
        return deleted
    return 0


async def invalidate_user_dashboard(user_id: str) -> None:
    """Briše sve dashboard cache ključeve za korisnika."""
    await cache_delete(f"dashboard:{user_id}:*")
