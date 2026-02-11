import datetime
from uuid import UUID

from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.models import Budget, Category, Transaction, TransactionType
from src.modules.budgets.schemas import BudgetCreate, BudgetUpdate, BudgetFilters, BudgetSummaryItem
from src.utils.errors import NotFoundError, ValidationError


async def create_budget(db: AsyncSession, user_id: UUID, data: BudgetCreate) -> Budget:
    # Provera da kategorija postoji i pripada korisniku
    cat = await db.execute(
        select(Category).where(Category.id == data.category_id, Category.user_id == user_id)
    )
    if not cat.scalar_one_or_none():
        raise NotFoundError("Category")

    # Provera da vec ne postoji budget za istu kategoriju i mesec
    existing = await db.execute(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.category_id == data.category_id,
            Budget.month == data.month,
        )
    )
    if existing.scalar_one_or_none():
        raise ValidationError("Budget za ovu kategoriju i mesec vec postoji")

    budget = Budget(
        user_id=user_id,
        category_id=data.category_id,
        amount=data.amount,
        month=data.month,
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget


async def get_budgets(db: AsyncSession, user_id: UUID, filters: BudgetFilters) -> list[Budget]:
    query = select(Budget).where(Budget.user_id == user_id)

    if filters.month:
        query = query.where(Budget.month == filters.month)
    if filters.category_id:
        query = query.where(Budget.category_id == filters.category_id)

    query = query.order_by(Budget.month.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_budget_by_id(db: AsyncSession, user_id: UUID, budget_id: int) -> Budget:
    query = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
    result = await db.execute(query)
    budget = result.scalar_one_or_none()

    if not budget:
        raise NotFoundError("Budget")
    return budget


async def update_budget(
    db: AsyncSession, user_id: UUID, budget_id: int, data: BudgetUpdate
) -> Budget:
    budget = await get_budget_by_id(db, user_id, budget_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    await db.commit()
    await db.refresh(budget)
    return budget


async def delete_budget(db: AsyncSession, user_id: UUID, budget_id: int) -> None:
    budget = await get_budget_by_id(db, user_id, budget_id)
    await db.delete(budget)
    await db.commit()


async def get_budget_summary(
    db: AsyncSession, user_id: UUID, month: datetime.date
) -> list[BudgetSummaryItem]:
    """Vraca sve budzete za mesec sa iznosom potrosenog."""
    budgets_query = (
        select(Budget, Category.name)
        .join(Category, Budget.category_id == Category.id)
        .where(Budget.user_id == user_id, Budget.month == month)
        .order_by(Category.name)
    )
    budgets_result = await db.execute(budgets_query)
    rows = budgets_result.all()

    summary = []
    for budget, category_name in rows:
        # Potroseno u ovom mesecu za ovu kategoriju
        spent_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == budget.category_id,
            Transaction.type == TransactionType.expense,
            extract("year", Transaction.date) == month.year,
            extract("month", Transaction.date) == month.month,
        )
        spent = (await db.execute(spent_query)).scalar()

        summary.append(
            BudgetSummaryItem(
                id=budget.id,
                category_id=budget.category_id,
                category_name=category_name,
                budgeted=float(budget.amount),
                spent=float(spent),
                remaining=float(budget.amount) - float(spent),
                month=budget.month,
            )
        )

    return summary
