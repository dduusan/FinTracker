from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Naziv kategorije")
    type: CategoryType
    icon: Optional[str] = Field(None, max_length=50, description="Emoji ikonica")


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[CategoryType] = None
    icon: Optional[str] = Field(None, max_length=50)


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: CategoryType
    icon: Optional[str]

    model_config = {"from_attributes": True}
