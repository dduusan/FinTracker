from redis.asyncio import Redis

from src.config.settings import settings

redis_client: Redis | None = None


async def init_redis() -> Redis:
    """Kreira Redis konekciju pri pokretanju aplikacije."""
    global redis_client
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    return redis_client


async def close_redis() -> None:
    """Zatvara Redis konekciju pri gašenju aplikacije."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


def get_redis() -> Redis:
    """Vraća Redis klijent. Koristi se u aplikaciji."""
    if not redis_client:
        raise RuntimeError("Redis nije inicijalizovan")
    return redis_client
