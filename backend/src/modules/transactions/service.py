from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.models import Transaction
from src.modules.transactions.schemas import TransactionCreate, TransactionUpdate, TransactionFilters
from src.utils.errors import NotFoundError


async def create_transaction(db: AsyncSession, user_id: UUID, data: TransactionCreate) -> Transaction:
    transaction = Transaction(
        user_id=user_id,
        category_id=data.category_id,
        amount=data.amount,
        type=data.type.value,
        description=data.description,
        date=data.date,
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction


async def get_transactions(db: AsyncSession, user_id: UUID, filters: TransactionFilters) -> dict:
    query = select(Transaction).where(Transaction.user_id == user_id)

    if filters.type:
        query = query.where(Transaction.type == filters.type.value)
    if filters.category_id:
        query = query.where(Transaction.category_id == filters.category_id)
    if filters.date_from:
        query = query.where(Transaction.date >= filters.date_from)
    if filters.date_to:
        query = query.where(Transaction.date <= filters.date_to)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    offset = (filters.page - 1) * filters.per_page
    query = query.order_by(Transaction.date.desc()).offset(offset).limit(filters.per_page)

    result = await db.execute(query)
    transactions = result.scalars().all()

    return {
        "data": transactions,
        "total": total,
        "page": filters.page,
        "per_page": filters.per_page,
        "total_pages": (total + filters.per_page - 1) // filters.per_page if total else 0,
    }


async def get_transaction_by_id(db: AsyncSession, user_id: UUID, transaction_id: UUID) -> Transaction:
    query = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    )
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise NotFoundError("Transaction")
    return transaction


async def update_transaction(
    db: AsyncSession, user_id: UUID, transaction_id: UUID, data: TransactionUpdate
) -> Transaction:
    transaction = await get_transaction_by_id(db, user_id, transaction_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "type" and value is not None:
            value = value.value
        setattr(transaction, field, value)

    await db.commit()
    await db.refresh(transaction)
    return transaction


async def delete_transaction(db: AsyncSession, user_id: UUID, transaction_id: UUID) -> None:
    transaction = await get_transaction_by_id(db, user_id, transaction_id)
    await db.delete(transaction)
    await db.commit()
