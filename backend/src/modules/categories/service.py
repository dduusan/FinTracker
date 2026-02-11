from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.models import Category
from src.modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryType
from src.utils.errors import NotFoundError, ValidationError


async def create_category(db: AsyncSession, user_id: UUID, data: CategoryCreate) -> Category:
    existing = await db.execute(
        select(Category).where(
            Category.user_id == user_id,
            Category.name == data.name,
            Category.type == data.type.value,
        )
    )
    if existing.scalar_one_or_none():
        raise ValidationError(f"Kategorija '{data.name}' ({data.type.value}) vec postoji")

    category = Category(
        user_id=user_id,
        name=data.name,
        type=data.type.value,
        icon=data.icon,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def get_categories(
    db: AsyncSession, user_id: UUID, type_filter: CategoryType | None = None
) -> list[Category]:
    query = select(Category).where(Category.user_id == user_id)

    if type_filter:
        query = query.where(Category.type == type_filter.value)

    query = query.order_by(Category.name)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_category_by_id(db: AsyncSession, user_id: UUID, category_id: int) -> Category:
    query = select(Category).where(
        Category.id == category_id,
        Category.user_id == user_id,
    )
    result = await db.execute(query)
    category = result.scalar_one_or_none()

    if not category:
        raise NotFoundError("Category")
    return category


async def update_category(
    db: AsyncSession, user_id: UUID, category_id: int, data: CategoryUpdate
) -> Category:
    category = await get_category_by_id(db, user_id, category_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "type" and value is not None:
            value = value.value
        setattr(category, field, value)

    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, user_id: UUID, category_id: int) -> None:
    category = await get_category_by_id(db, user_id, category_id)
    await db.delete(category)
    await db.commit()
