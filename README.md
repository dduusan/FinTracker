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

### Frontend
- **React 19** + **TypeScript** — UI framework
- **Vite** — build tool and dev server
- **Tailwind CSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **React Hook Form** — form handling with validation
- **Recharts** — charts and graphs (bar, line, pie)
- **Axios** — HTTP client with interceptors (auto token refresh)
- **Lucide React** — icons
- **React Hot Toast** — toast notifications
- **date-fns** — date formatting
- **Vitest** + **React Testing Library** — unit tests (26 tests)
- **Playwright** — E2E tests (10 tests)

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
│   ├── docker-compose.yml         # 4 services: frontend, app, postgres, redis
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.ts           # Axios instance with token interceptors
│   │   │   ├── auth.ts            # Auth API calls (login, register, refresh, me)
│   │   │   ├── transactions.ts    # Transaction CRUD API calls
│   │   │   ├── categories.ts      # Category CRUD API calls
│   │   │   ├── budgets.ts         # Budget CRUD + summary API calls
│   │   │   └── dashboard.ts       # Dashboard API calls (summary, monthly, etc.)
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx     # Reusable button with loading state
│   │   │   │   ├── Input.tsx      # Form input with label and error display
│   │   │   │   ├── Card.tsx       # Card container component
│   │   │   │   └── Modal.tsx      # Modal dialog with backdrop
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.tsx       # Income, expenses, balance, count
│   │   │   │   ├── MonthlyChart.tsx       # Bar/line chart of monthly trends
│   │   │   │   ├── CategoryPieChart.tsx   # Pie chart by category
│   │   │   │   └── RecentTransactions.tsx # Latest transactions table
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionTable.tsx   # Sortable transaction table
│   │   │   │   ├── TransactionForm.tsx    # Create/edit transaction form
│   │   │   │   ├── TransactionFilters.tsx # Type, category, date filters
│   │   │   │   └── DeleteConfirmModal.tsx # Delete confirmation dialog
│   │   │   ├── categories/
│   │   │   │   ├── CategoryCard.tsx       # Category display with icon
│   │   │   │   └── CategoryForm.tsx       # Create/edit category form
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetCard.tsx         # Budget with progress bar
│   │   │   │   ├── BudgetForm.tsx         # Create/edit budget form
│   │   │   │   └── MonthSelector.tsx      # Month navigation selector
│   │   │   ├── ProtectedRoute.tsx         # Auth guard — redirects to /login
│   │   │   └── ErrorBoundary.tsx          # Catches React errors gracefully
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state (user, login, logout, register)
│   │   ├── hooks/
│   │   │   └── useDashboard.ts   # Dashboard data fetching hook
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx # Sidebar + header + main content area
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # Login form with validation
│   │   │   ├── RegisterPage.tsx   # Registration form with validation
│   │   │   ├── DashboardPage.tsx  # Dashboard with charts and stats
│   │   │   ├── TransactionsPage.tsx # Transaction CRUD with filters
│   │   │   ├── CategoriesPage.tsx # Category management
│   │   │   └── BudgetsPage.tsx    # Budget tracking with progress bars
│   │   ├── lib/
│   │   │   └── utils.ts          # formatCurrency, formatDate, cn helper
│   │   ├── tests/                # Unit tests (Vitest + RTL)
│   │   ├── App.tsx               # Root component with routing
│   │   └── main.tsx              # Entry point
│   ├── e2e/                      # E2E tests (Playwright)
│   │   ├── auth.spec.ts          # 5 auth flow tests
│   │   └── navigation.spec.ts   # 5 navigation/redirect tests
│   ├── Dockerfile                # Multi-stage: node build → nginx serve
│   ├── nginx.conf                # SPA routing + API proxy to backend
│   ├── playwright.config.ts      # E2E test configuration
│   ├── vitest.config.ts          # Unit test configuration
│   └── package.json              # Dependencies and scripts
└── .github/workflows/ci.yml     # CI: backend test+lint, frontend check, docker build
```

## Features

- **Authentication** — Register, login, JWT access/refresh tokens, protected routes
- **Dashboard** — Summary cards (income, expenses, balance), monthly trend chart, category pie chart, recent transactions
- **Transactions** — Full CRUD, filterable by type/category/date range, paginated table with sorting
- **Categories** — Income and expense categories with emoji icons, CRUD management
- **Budgets** — Monthly budgets per category, progress bars showing spent vs planned, month navigation
- **Responsive UI** — Sidebar navigation, mobile-friendly layout
- **Error Handling** — Error boundary, toast notifications, form validation

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
- Node.js 22+
- Docker Desktop

### Quick Start (recommended)

All commands run from the root `FinTrackerApp/` directory:

```bash
# 1. Start Docker Desktop

# 2. Start PostgreSQL + Redis containers
npm run docker

# 3. Start backend (Terminal 1)
npm run backend
# API at http://localhost:8000
# Swagger docs at http://localhost:8000/docs

# 4. Start frontend (Terminal 2)
npm run frontend
# App at http://localhost:3000

# 5. Seed test data (optional, first time only)
npm run seed
```

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

### Frontend — Local Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# App available at http://localhost:3000
```

### Docker — Full Stack

```bash
cd backend

# Start everything (frontend + backend + postgres + redis)
docker compose up --build

# Frontend at http://localhost (port 80)
# Backend at http://localhost:8000

# Stop
docker compose down

# Stop and delete data
docker compose down -v
```

## Testing

### Backend Tests (49 tests)

```bash
cd backend
pytest                          # All tests
pytest tests/test_auth.py       # Auth tests only
pytest -k "test_login"          # Single test by name
```

### Frontend Unit Tests (26 tests)

```bash
cd frontend
npm test                        # Run all unit tests
npm run test:watch              # Watch mode
npm run typecheck               # TypeScript type checking
npm run lint                    # ESLint
```

### Frontend E2E Tests (10 tests)

```bash
cd frontend
npx playwright install chromium # Install browser (first time)
npm run test:e2e                # Run E2E tests (headless)
npm run test:e2e:ui             # Run with Playwright UI
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

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

| Job | Description |
|-----|-------------|
| `test` | Backend — pytest (49 tests) |
| `lint` | Backend — import verification |
| `frontend-check` | Frontend — lint, typecheck, unit tests, build |
| `docker` | Build backend + frontend Docker images |

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
| 9 | Frontend — Setup, layout, UI components | Done |
| 10 | Frontend — Authentication (login, register, protected routes) | Done |
| 11 | Frontend — Dashboard (charts, summary cards) | Done |
| 12 | Frontend — Transactions CRUD (table, filters, forms) | Done |
| 13 | Frontend — Categories CRUD | Done |
| 14 | Frontend — Budgets (progress bars, month selector) | Done |
| 15 | Frontend — UX polish (error boundary, loading states, toast) | Done |
| 16 | Frontend — Localization (Serbian → English) | Done |
| 17 | Frontend — Tests, Docker, CI/CD (26 unit + 10 E2E tests) | Done |
