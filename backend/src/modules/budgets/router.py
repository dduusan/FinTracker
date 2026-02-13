import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.models import User
from src.middleware.auth import get_current_user
from src.modules.budgets.schemas import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetSummaryItem,
    BudgetFilters,
)
from src.modules.budgets import service
from src.utils.cache import invalidate_user_dashboard

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.create_budget(db, current_user.id, data)
    await invalidate_user_dashboard(str(current_user.id))
    return result


@router.get("/", response_model=list[BudgetResponse])
async def list_budgets(
    month: Optional[datetime.date] = None,
    category_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = BudgetFilters(month=month, category_id=category_id)
    return await service.get_budgets(db, current_user.id, filters)


@router.get("/summary", response_model=list[BudgetSummaryItem])
async def budget_summary(
    month: datetime.date = Query(..., description="Prvi dan meseca, npr. 2026-02-01"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Pregled budzeta sa potrosenim iznosima za dati mesec."""
    return await service.get_budget_summary(db, current_user.id, month)


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_budget_by_id(db, current_user.id, budget_id)


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await service.update_budget(db, current_user.id, budget_id, data)
    await invalidate_user_dashboard(str(current_user.id))
    return result


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_budget(db, current_user.id, budget_id)
    await invalidate_user_dashboard(str(current_user.id))
