import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Iznos mora biti pozitivan")
    type: TransactionType
    category_id: int = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)
    date: datetime.date


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[TransactionType] = None
    category_id: Optional[int] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)
    date: Optional[datetime.date] = None


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: int
    amount: float
    type: TransactionType
    description: Optional[str]
    date: datetime.date
    created_at: str

    model_config = {"from_attributes": True}


class TransactionFilters(BaseModel):
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    date_from: Optional[datetime.date] = None
    date_to: Optional[datetime.date] = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
