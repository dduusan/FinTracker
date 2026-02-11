"""Seed script — ubacuje test korisnika, kategorije i budzete u bazu."""

import asyncio
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.config.database import async_session, engine, Base
from src.config.models import User, Category, Budget, TransactionType
from src.modules.auth.service import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Test user
        user = User(
            email="test@test.com",
            password=hash_password("test123"),
            name="Test User",
        )
        db.add(user)
        await db.flush()

        # Kategorije
        categories = [
            Category(user_id=user.id, name="Plata", type=TransactionType.income, icon="💰"),
            Category(user_id=user.id, name="Freelance", type=TransactionType.income, icon="💻"),
            Category(user_id=user.id, name="Hrana", type=TransactionType.expense, icon="🍔"),
            Category(user_id=user.id, name="Transport", type=TransactionType.expense, icon="🚗"),
            Category(user_id=user.id, name="Stanarina", type=TransactionType.expense, icon="🏠"),
            Category(user_id=user.id, name="Zabava", type=TransactionType.expense, icon="🎮"),
        ]
        db.add_all(categories)
        await db.flush()

        # Budzeti za tekuci mesec (expense kategorije)
        current_month = date.today().replace(day=1)
        budgets = [
            Budget(user_id=user.id, category_id=categories[2].id, amount=20000, month=current_month),  # Hrana
            Budget(user_id=user.id, category_id=categories[3].id, amount=5000, month=current_month),   # Transport
            Budget(user_id=user.id, category_id=categories[4].id, amount=30000, month=current_month),  # Stanarina
            Budget(user_id=user.id, category_id=categories[5].id, amount=10000, month=current_month),  # Zabava
        ]
        db.add_all(budgets)
        await db.commit()

        print(f"Kreiran user: {user.email} (password: test123)")
        print(f"Kreirano {len(categories)} kategorija")
        print(f"Kreirano {len(budgets)} budzeta za {current_month}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
