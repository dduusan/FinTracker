from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from src.config.redis import get_redis
from src.utils.logger import logger

# Limiti po tipu rute
RATE_LIMITS = {
    "auth": {"requests": 10, "window": 60},      # 10 req/min za auth
    "default": {"requests": 60, "window": 60},    # 60 req/min za ostalo
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Preskoči health check
        if request.url.path == "/api/health":
            return await call_next(request)

        # Odredi tip limita
        if request.url.path.startswith("/api/auth"):
            limit_type = "auth"
        else:
            limit_type = "default"

        limits = RATE_LIMITS[limit_type]

        # Identifikator: IP adresa (ili user ID ako je autentifikovan)
        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{limit_type}:{client_ip}"

        try:
            redis = get_redis()
            current = await redis.incr(key)

            if current == 1:
                await redis.expire(key, limits["window"])

            if current > limits["requests"]:
                ttl = await redis.ttl(key)
                logger.warning(f"Rate limit exceeded: {client_ip} ({limit_type}: {current}/{limits['requests']})")
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Previse zahteva. Pokusajte ponovo kasnije.",
                        "retry_after": ttl,
                    },
                    headers={"Retry-After": str(ttl)},
                )

            response = await call_next(request)

            # Dodaj rate limit info u response headers
            response.headers["X-RateLimit-Limit"] = str(limits["requests"])
            response.headers["X-RateLimit-Remaining"] = str(max(0, limits["requests"] - current))
            response.headers["X-RateLimit-Reset"] = str(await redis.ttl(key))

            return response

        except Exception:
            # Ako Redis nije dostupan, pusti request da prođe
            return await call_next(request)
