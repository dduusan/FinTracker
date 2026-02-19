"""Seed script — ubacuje test korisnika, kategorije, budzete i transakcije u bazu."""

import asyncio
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import select
from src.config.database import async_session, engine, Base
from src.config.models import User, Category, Budget, Transaction, TransactionType
from src.modules.auth.service import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Proveri da li korisnik vec postoji
        existing = await db.scalar(select(User).where(User.email == "test@test.com"))
        if existing:
            print("Korisnik test@test.com vec postoji u bazi. Seed preskocen.")
            print("Ako zelis da resetujes podatke, obrisi korisnika iz baze pa pokreni ponovo.")
            await engine.dispose()
            return

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
            Budget(user_id=user.id, category_id=categories[2].id, amount=20000, month=current_month),
            Budget(user_id=user.id, category_id=categories[3].id, amount=5000, month=current_month),
            Budget(user_id=user.id, category_id=categories[4].id, amount=30000, month=current_month),
            Budget(user_id=user.id, category_id=categories[5].id, amount=10000, month=current_month),
        ]
        db.add_all(budgets)
        await db.flush()

        # Test transakcije (poslednja 3 meseca)
        today = date.today()
        transactions = [
            # Tekuci mesec
            Transaction(user_id=user.id, category_id=categories[0].id, amount=85000, type=TransactionType.income, description="Februarska plata", date=today.replace(day=1)),
            Transaction(user_id=user.id, category_id=categories[1].id, amount=25000, type=TransactionType.income, description="Web projekat", date=today.replace(day=5)),
            Transaction(user_id=user.id, category_id=categories[4].id, amount=30000, type=TransactionType.expense, description="Stanarina", date=today.replace(day=2)),
            Transaction(user_id=user.id, category_id=categories[2].id, amount=4500, type=TransactionType.expense, description="Maxi", date=today.replace(day=8)),
            Transaction(user_id=user.id, category_id=categories[3].id, amount=1800, type=TransactionType.expense, description="Gorivo", date=today.replace(day=10)),
            Transaction(user_id=user.id, category_id=categories[5].id, amount=3200, type=TransactionType.expense, description="Bioskop i večera", date=today.replace(day=14)),
            Transaction(user_id=user.id, category_id=categories[2].id, amount=3800, type=TransactionType.expense, description="Lidl", date=today.replace(day=16)),
            # Prethodni mesec
            Transaction(user_id=user.id, category_id=categories[0].id, amount=85000, type=TransactionType.income, description="Januarska plata", date=(today - timedelta(days=30)).replace(day=1)),
            Transaction(user_id=user.id, category_id=categories[4].id, amount=30000, type=TransactionType.expense, description="Stanarina", date=(today - timedelta(days=30)).replace(day=2)),
            Transaction(user_id=user.id, category_id=categories[2].id, amount=15000, type=TransactionType.expense, description="Namirnice", date=(today - timedelta(days=25))),
            Transaction(user_id=user.id, category_id=categories[3].id, amount=2500, type=TransactionType.expense, description="Mesecna karta", date=(today - timedelta(days=28))),
            Transaction(user_id=user.id, category_id=categories[5].id, amount=6000, type=TransactionType.expense, description="Restoran", date=(today - timedelta(days=20))),
            # Pre dva meseca
            Transaction(user_id=user.id, category_id=categories[0].id, amount=85000, type=TransactionType.income, description="Decembarska plata", date=(today - timedelta(days=60)).replace(day=1)),
            Transaction(user_id=user.id, category_id=categories[1].id, amount=40000, type=TransactionType.income, description="Godisnji bonus", date=(today - timedelta(days=55))),
            Transaction(user_id=user.id, category_id=categories[4].id, amount=30000, type=TransactionType.expense, description="Stanarina", date=(today - timedelta(days=58)).replace(day=2)),
            Transaction(user_id=user.id, category_id=categories[2].id, amount=18000, type=TransactionType.expense, description="Namirnice", date=(today - timedelta(days=50))),
        ]
        db.add_all(transactions)
        await db.commit()

        print(f"Kreiran user: {user.email} (password: test123)")
        print(f"Kreirano {len(categories)} kategorija")
        print(f"Kreirano {len(budgets)} budzeta za {current_month}")
        print(f"Kreirano {len(transactions)} transakcija")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
