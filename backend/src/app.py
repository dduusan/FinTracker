from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.config.settings import settings
from src.config.database import engine, Base
from src.middleware.error_handler import app_error_handler, generic_error_handler
from src.modules.transactions.router import router as transactions_router
from src.utils.errors import AppError
from src.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting FinTracker API ({settings.APP_ENV})")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")
    yield
    await engine.dispose()
    logger.info("FinTracker API shut down")


app = FastAPI(
    title="FinTracker API",
    description="Personal Finance Tracker REST API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

app.include_router(transactions_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


if __name__ == "__main__":
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

    import uvicorn
    uvicorn.run("src.app:app", host="0.0.0.0", port=settings.APP_PORT, reload=True)
