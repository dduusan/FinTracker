from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.modules.transactions.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionFilters,
    TransactionType,
)
from src.modules.transactions import service

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

# TODO: Zameniti pravim korisnikom iz auth middleware-a (Faza 3)
TEMP_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(data: TransactionCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_transaction(db, TEMP_USER_ID, data)


@router.get("/")
async def list_transactions(
    type: TransactionType | None = None,
    category_id: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = TransactionFilters(
        type=type, category_id=category_id,
        date_from=date_from, date_to=date_to,
        page=page, per_page=per_page,
    )
    return await service.get_transactions(db, TEMP_USER_ID, filters)


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: UUID, db: AsyncSession = Depends(get_db)):
    return await service.get_transaction_by_id(db, TEMP_USER_ID, transaction_id)


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID, data: TransactionUpdate, db: AsyncSession = Depends(get_db)
):
    return await service.update_transaction(db, TEMP_USER_ID, transaction_id, data)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: UUID, db: AsyncSession = Depends(get_db)):
    await service.delete_transaction(db, TEMP_USER_ID, transaction_id)
