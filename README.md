# FinTracker

Personal finance tracker application for managing income, expenses, budgets and financial statistics.

## Tech Stack

### Backend
- **Python 3.12** + **FastAPI** — async REST API
- **SQLAlchemy 2.0** (async) + **Alembic** — ORM and database migrations
- **PostgreSQL** — primary database
- **Redis** — caching (dashboard data, 5min TTL) + rate limiting
- **Pydantic v2** — request/response validation
- **JWT** (python-jose) — authentication (access + refresh tokens)
- **pytest** + **httpx** — testing (49 tests)
- **Docker** + **Docker Compose** — containerization
- **GitHub Actions** — CI/CD pipeline

### Frontend (in progress)
- **React 19** + **TypeScript** — UI framework
- **Vite** — build tool
- **Tailwind CSS** — styling
- **React Router** — client-side routing
- **Recharts** — charts and graphs
- **Axios** — HTTP client

## Project Structure

```
FinTrackerApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── settings.py        # Environment config (pydantic-settings)
│   │   │   ├── database.py        # Async SQLAlchemy engine & session
│   │   │   ├── models.py          # Database models (User, Transaction, Category, Budget)
│   │   │   └── redis.py           # Redis connection management
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── router.py      # POST register, login, refresh | GET me
│   │   │   │   ├── service.py     # Password hashing, JWT creation/validation
│   │   │   │   └── schemas.py     # UserCreate, LoginRequest, TokenResponse
│   │   │   ├── transactions/
│   │   │   │   ├── router.py      # CRUD endpoints for transactions
│   │   │   │   ├── service.py     # Transaction queries with filtering & pagination
│   │   │   │   └── schemas.py     # TransactionCreate, TransactionResponse
│   │   │   ├── categories/
│   │   │   │   ├── router.py      # CRUD endpoints for categories
│   │   │   │   ├── service.py     # Category management with duplicate check
│   │   │   │   └── schemas.py     # CategoryCreate, CategoryResponse
│   │   │   ├── budgets/
│   │   │   │   ├── router.py      # CRUD + summary endpoint
│   │   │   │   ├── service.py     # Budget queries with spent calculation
│   │   │   │   └── schemas.py     # BudgetCreate, BudgetSummaryItem
│   │   │   └── dashboard/
│   │   │       ├── router.py      # Summary, monthly, by-category, recent
│   │   │       ├── service.py     # Aggregation queries (SUM, GROUP BY)
│   │   │       └── schemas.py     # SummaryResponse, MonthlyItem, CategorySpending
│   │   ├── middleware/
│   │   │   ├── auth.py            # JWT Bearer token validation
│   │   │   ├── error_handlers.py  # Centralized error handling
│   │   │   └── rate_limiter.py    # Redis-based rate limiting (10/min auth, 60/min other)
│   │   └── utils/
│   │       ├── errors.py          # Custom error classes (AppError, NotFoundError, AuthError)
│   │       ├── logger.py          # Logging configuration
│   │       └── cache.py           # Redis cache get/set/delete/invalidate
│   ├── tests/
│   │   ├── conftest.py            # Test config (SQLite in-memory, mock Redis, fixtures)
│   │   ├── test_auth.py           # 11 auth tests
│   │   ├── test_transactions.py   # 8 transaction tests
│   │   ├── test_categories.py     # 8 category tests
│   │   ├── test_budgets.py        # 8 budget tests
│   │   └── test_dashboard.py      # 8 dashboard tests
│   ├── alembic/                   # Database migrations
│   ├── seed.py                    # Seed script (test user + categories + budgets)
│   ├── Dockerfile                 # Python 3.12-slim image
│   ├── docker-compose.yml         # 3 services: app, postgres, redis
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Environment variables template
├── frontend/                      # React + Vite (in progress)
└── .github/workflows/ci.yml      # CI: test, lint, docker build
```

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user info |

### Transactions (`/api/transactions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/transactions/` | Yes | Create transaction |
| GET | `/api/transactions/` | Yes | List with filters & pagination |
| GET | `/api/transactions/{id}` | Yes | Get single transaction |
| PUT | `/api/transactions/{id}` | Yes | Update transaction |
| DELETE | `/api/transactions/{id}` | Yes | Delete transaction |

### Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/categories/` | Yes | Create category |
| GET | `/api/categories/` | Yes | List categories (filter by type) |
| GET | `/api/categories/{id}` | Yes | Get single category |
| PUT | `/api/categories/{id}` | Yes | Update category |
| DELETE | `/api/categories/{id}` | Yes | Delete category |

### Budgets (`/api/budgets`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/budgets/` | Yes | Create budget |
| GET | `/api/budgets/` | Yes | List budgets |
| GET | `/api/budgets/summary` | Yes | Monthly summary with spent amounts |
| GET | `/api/budgets/{id}` | Yes | Get single budget |
| PUT | `/api/budgets/{id}` | Yes | Update budget |
| DELETE | `/api/budgets/{id}` | Yes | Delete budget |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/summary` | Yes | Income/expense totals & balance |
| GET | `/api/dashboard/monthly` | Yes | Monthly trends (last N months) |
| GET | `/api/dashboard/by-category` | Yes | Spending breakdown by category |
| GET | `/api/dashboard/recent` | Yes | Recent transactions list |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |

## Getting Started

### Prerequisites
- Python 3.12+
- Docker Desktop
- Node.js 18+ (for frontend)

### Backend — Local Development

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis via Docker
docker compose up postgres redis -d

# Run database migrations
alembic upgrade head

# Seed test data (optional)
python seed.py

# Start the server
python src/app.py
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Backend — Docker (all services)

```bash
cd backend

# Start everything (app + postgres + redis)
docker compose up --build

# Start in background
docker compose up --build -d

# Stop
docker compose down

# Stop and delete data
docker compose down -v
```

### Run Tests

```bash
cd backend
pytest                          # All 49 tests
pytest tests/test_auth.py       # Auth tests only
pytest -k "test_login"          # Single test by name
```

## Environment Variables

```env
APP_ENV=development
APP_PORT=8000
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/fintracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project structure + configuration | Done |
| 2 | Database models + migrations (SQLAlchemy + Alembic) | Done |
| 3 | Authentication (JWT access + refresh tokens) | Done |
| 4 | Categories + Budgets modules | Done |
| 5 | Dashboard (statistics + aggregations) | Done |
| 6 | Redis caching + Rate limiting | Done |
| 7 | Testing (49 tests with pytest) | Done |
| 8 | Docker + CI/CD (GitHub Actions) | Done |
| 9 | Frontend (React + Vite + Tailwind) | In Progress |
