"""Seed script — ubacuje test korisnika i kategorije u bazu."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.config.database import async_session, engine, Base
from src.config.models import User, Category, TransactionType
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
        await db.commit()

        print(f"Kreiran user: {user.email} (password: test123)")
        print(f"Kreirano {len(categories)} kategorija")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
