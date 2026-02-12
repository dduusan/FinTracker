import datetime
from uuid import UUID

from sqlalchemy import select, func, case, extract
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.models import Transaction, Category, TransactionType
from src.modules.dashboard.schemas import (
    SummaryResponse,
    MonthlyItem,
    MonthlyResponse,
    CategorySpending,
    ByCategoryResponse,
    RecentTransaction,
)


async def get_summary(
    db: AsyncSession,
    user_id: UUID,
    date_from: datetime.date | None = None,
    date_to: datetime.date | None = None,
) -> SummaryResponse:
    """Ukupni prihodi, rashodi i bilans za period."""
    query = select(
        func.coalesce(
            func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)), 0
        ).label("total_income"),
        func.coalesce(
            func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)), 0
        ).label("total_expense"),
        func.count(Transaction.id).label("transaction_count"),
    ).where(Transaction.user_id == user_id)

    if date_from:
        query = query.where(Transaction.date >= date_from)
    if date_to:
        query = query.where(Transaction.date <= date_to)

    result = await db.execute(query)
    row = result.one()

    income = float(row.total_income)
    expense = float(row.total_expense)

    return SummaryResponse(
        total_income=income,
        total_expense=expense,
        balance=income - expense,
        transaction_count=row.transaction_count,
        date_from=date_from,
        date_to=date_to,
    )


async def get_monthly_trends(
    db: AsyncSession,
    user_id: UUID,
    months: int = 6,
) -> MonthlyResponse:
    """Mesecni trend prihoda i rashoda za poslednjih N meseci."""
    cutoff = datetime.date.today().replace(day=1) - datetime.timedelta(days=(months - 1) * 28)
    cutoff = cutoff.replace(day=1)

    query = (
        select(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.coalesce(
                func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)), 0
            ).label("income"),
            func.coalesce(
                func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)), 0
            ).label("expense"),
        )
        .where(Transaction.user_id == user_id, Transaction.date >= cutoff)
        .group_by("year", "month")
        .order_by("year", "month")
    )

    result = await db.execute(query)
    rows = result.all()

    data = []
    for row in rows:
        income = float(row.income)
        expense = float(row.expense)
        data.append(
            MonthlyItem(
                month=f"{int(row.year)}-{int(row.month):02d}",
                income=income,
                expense=expense,
                balance=income - expense,
            )
        )

    return MonthlyResponse(data=data, months_count=len(data))


async def get_by_category(
    db: AsyncSession,
    user_id: UUID,
    transaction_type: str = "expense",
    date_from: datetime.date | None = None,
    date_to: datetime.date | None = None,
) -> ByCategoryResponse:
    """Potrosnja po kategorijama sa procentima."""
    query = (
        select(
            Category.id,
            Category.name,
            Category.icon,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("tx_count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(Transaction.user_id == user_id, Transaction.type == transaction_type)
    )

    if date_from:
        query = query.where(Transaction.date >= date_from)
    if date_to:
        query = query.where(Transaction.date <= date_to)

    query = query.group_by(Category.id, Category.name, Category.icon).order_by(func.sum(Transaction.amount).desc())

    result = await db.execute(query)
    rows = result.all()

    grand_total = sum(float(row.total) for row in rows)

    data = [
        CategorySpending(
            category_id=row.id,
            category_name=row.name,
            icon=row.icon,
            total=float(row.total),
            percentage=round(float(row.total) / grand_total * 100, 1) if grand_total > 0 else 0,
            transaction_count=row.tx_count,
        )
        for row in rows
    ]

    return ByCategoryResponse(data=data, grand_total=grand_total)


async def get_recent_transactions(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 10,
) -> list[RecentTransaction]:
    """Poslednjih N transakcija sa imenom kategorije."""
    query = (
        select(Transaction, Category.name.label("cat_name"), Category.icon.label("cat_icon"))
        .join(Category, Transaction.category_id == Category.id)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        RecentTransaction(
            id=str(row.Transaction.id),
            amount=float(row.Transaction.amount),
            type=row.Transaction.type.value if hasattr(row.Transaction.type, 'value') else row.Transaction.type,
            description=row.Transaction.description,
            date=row.Transaction.date,
            category_name=row.cat_name,
            category_icon=row.cat_icon,
            created_at=row.Transaction.created_at,
        )
        for row in rows
    ]
