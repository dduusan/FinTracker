import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.models import User
from src.middleware.auth import get_current_user
from src.modules.dashboard.schemas import (
    SummaryResponse,
    MonthlyResponse,
    ByCategoryResponse,
    RecentTransaction,
)
from src.modules.dashboard import service
from src.utils.cache import cache_get, cache_set

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

DASHBOARD_CACHE_TTL = 300  # 5 minuta


@router.get("/summary", response_model=SummaryResponse)
async def summary(
    date_from: Optional[datetime.date] = None,
    date_to: Optional[datetime.date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ukupni prihodi, rashodi i bilans za period."""
    cache_key = f"dashboard:{current_user.id}:summary:{date_from}:{date_to}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await service.get_summary(db, current_user.id, date_from, date_to)
    await cache_set(cache_key, result.model_dump(mode="json"), DASHBOARD_CACHE_TTL)
    return result


@router.get("/monthly", response_model=MonthlyResponse)
async def monthly_trends(
    months: int = Query(6, ge=1, le=24, description="Broj meseci unazad"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mesecni trend prihoda i rashoda."""
    cache_key = f"dashboard:{current_user.id}:monthly:{months}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await service.get_monthly_trends(db, current_user.id, months)
    await cache_set(cache_key, result.model_dump(mode="json"), DASHBOARD_CACHE_TTL)
    return result


@router.get("/by-category", response_model=ByCategoryResponse)
async def by_category(
    type: str = Query("expense", description="income ili expense"),
    date_from: Optional[datetime.date] = None,
    date_to: Optional[datetime.date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Potrosnja/prihod po kategorijama sa procentima."""
    cache_key = f"dashboard:{current_user.id}:by-category:{type}:{date_from}:{date_to}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await service.get_by_category(db, current_user.id, type, date_from, date_to)
    await cache_set(cache_key, result.model_dump(mode="json"), DASHBOARD_CACHE_TTL)
    return result


@router.get("/recent", response_model=list[RecentTransaction])
async def recent_transactions(
    limit: int = Query(10, ge=1, le=50, description="Broj poslednjih transakcija"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Poslednjih N transakcija sa kategorijom."""
    cache_key = f"dashboard:{current_user.id}:recent:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await service.get_recent_transactions(db, current_user.id, limit)
    data = [r.model_dump(mode="json") for r in result]
    await cache_set(cache_key, data, DASHBOARD_CACHE_TTL)
    return result
