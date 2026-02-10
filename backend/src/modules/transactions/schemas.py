from datetime import date
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Iznos mora biti pozitivan")
    type: TransactionType
    category_id: int = Field(..., gt=0)
    description: str | None = Field(None, max_length=500)
    date: date


class TransactionUpdate(BaseModel):
    amount: float | None = Field(None, gt=0)
    type: TransactionType | None = None
    category_id: int | None = Field(None, gt=0)
    description: str | None = Field(None, max_length=500)
    date: date | None = None


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: int
    amount: float
    type: TransactionType
    description: str | None
    date: date
    created_at: str

    model_config = {"from_attributes": True}


class TransactionFilters(BaseModel):
    type: TransactionType | None = None
    category_id: int | None = None
    date_from: date | None = None
    date_to: date | None = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
