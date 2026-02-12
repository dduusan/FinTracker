import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PeriodFilter(BaseModel):
    date_from: Optional[datetime.date] = None
    date_to: Optional[datetime.date] = None


class SummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    transaction_count: int
    date_from: Optional[datetime.date]
    date_to: Optional[datetime.date]


class MonthlyItem(BaseModel):
    month: str  # "2026-02"
    income: float
    expense: float
    balance: float


class MonthlyResponse(BaseModel):
    data: list[MonthlyItem]
    months_count: int


class CategorySpending(BaseModel):
    category_id: int
    category_name: str
    icon: Optional[str]
    total: float
    percentage: float  # procenat od ukupne potrosnje
    transaction_count: int


class ByCategoryResponse(BaseModel):
    data: list[CategorySpending]
    grand_total: float


class RecentTransaction(BaseModel):
    id: str
    amount: float
    type: str
    description: Optional[str]
    date: datetime.date
    category_name: str
    category_icon: Optional[str]
    created_at: datetime.datetime
