"""Test configuration — SQLite in-memory (ne treba Docker za testove)."""

from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool

from src.config.database import Base, get_db
from src.config.models import User, Category, TransactionType
from src.modules.auth.service import hash_password, create_access_token


# ── SQLite async engine za testove ───────────────────────────────────
# StaticPool osigurava da sve konekcije dele istu in-memory bazu
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
test_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


# ── Database setup ───────────────────────────────────────────────────
@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Kreira tabele pre svakog testa i briše ih posle."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db():
    """Daje test DB sesiju."""
    async with test_session() as session:
        yield session


# ── Mock Redis ───────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def mock_redis():
    """Mockuje Redis tako da testovi ne trebaju Redis server."""
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock()
    mock.delete = AsyncMock(return_value=0)
    mock.incr = AsyncMock(return_value=1)
    mock.expire = AsyncMock()
    mock.ttl = AsyncMock(return_value=60)
    mock.scan_iter = lambda **kwargs: AsyncIterator([])
    mock.ping = AsyncMock()
    mock.close = AsyncMock()

    with patch("src.config.redis.redis_client", mock), \
         patch("src.config.redis.get_redis", return_value=mock), \
         patch("src.utils.cache.get_redis", return_value=mock):
        yield mock


class AsyncIterator:
    """Helper za mock async iteratora (scan_iter)."""
    def __init__(self, items):
        self.items = items
    def __aiter__(self):
        return self
    async def __anext__(self):
        if not self.items:
            raise StopAsyncIteration
        return self.items.pop(0)


# ── FastAPI test client ──────────────────────────────────────────────
@pytest_asyncio.fixture
async def client(db: AsyncSession):
    """HTTP klijent koji koristi test bazu."""
    from src.app import app

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# ── Test user + token ────────────────────────────────────────────────
@pytest_asyncio.fixture
async def test_user(db: AsyncSession) -> User:
    """Kreira test korisnika u bazi."""
    user = User(
        email="test@test.com",
        password=hash_password("test123"),
        name="Test User",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Vraća Authorization header sa validnim JWT tokenom."""
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


# ── Test categories ──────────────────────────────────────────────────
@pytest_asyncio.fixture
async def test_categories(db: AsyncSession, test_user: User) -> list[Category]:
    """Kreira test kategorije."""
    categories = [
        Category(user_id=test_user.id, name="Plata", type=TransactionType.income, icon="💰"),
        Category(user_id=test_user.id, name="Hrana", type=TransactionType.expense, icon="🍔"),
        Category(user_id=test_user.id, name="Transport", type=TransactionType.expense, icon="🚗"),
    ]
    db.add_all(categories)
    await db.commit()
    for cat in categories:
        await db.refresh(cat)
    return categories
