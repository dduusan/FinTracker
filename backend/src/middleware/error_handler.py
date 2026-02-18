from fastapi import Request
from fastapi.responses import JSONResponse

from src.utils.errors import AppError
from src.utils.logger import logger


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.warning(f"{exc.status_code} | {request.method} {request.url.path} | {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    import traceback
    logger.error(f"500 | {request.method} {request.url.path} | {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(status_code=500, content={"error": "Internal server error"})
