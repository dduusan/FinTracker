import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0, description="Planirani iznos za mesec")
    month: datetime.date = Field(..., description="Prvi dan meseca (npr. 2026-02-01)")


class BudgetUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    month: Optional[datetime.date] = None


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    amount: float
    month: datetime.date

    model_config = {"from_attributes": True}


class BudgetSummaryItem(BaseModel):
    id: int
    category_id: int
    category_name: str
    budgeted: float
    spent: float
    remaining: float
    month: datetime.date


class BudgetFilters(BaseModel):
    month: Optional[datetime.date] = None
    category_id: Optional[int] = None
