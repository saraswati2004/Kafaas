# KaFaaS — Kavir Fasal Sarthi

**KaFaaS (Kavir Fasal Sarthi)** is an agricultural technology and e-commerce platform for Indian agriculture. It combines an online marketplace for agrochemical inputs (fertilizers, fungicides, pesticides, seeds, bio-products) with a crop-disease advisory system that recommends treatment products based on scanned crop symptoms.

This repository contains the **full-stack web application**:

| Layer | Tech | Location |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 | `./src` |
| **Backend** | FastAPI (Python 3.12) + SQLAlchemy 2.0 (async) | `./kafaas_backend` |
| **Database** | SQLite (dev) / PostgreSQL · Supabase (prod) | `kafaas_backend/kafaas.db` |
| **Auth** | Supabase Auth / JWT (Bearer) with role-based access control | `kafaas_backend/app/core/security.py` |

> **Note on the mobile app:** The backend is designed to also serve a Flutter mobile app (`com.kafaas.kafaas_mobile_app`), but that app lives in a separate repository. This repo contains the React web storefront and the shared FastAPI backend.

---

## Table of Contents

- [System overview & roles](#system-overview--roles)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Demo accounts](#demo-accounts)
- [Environment variables](#environment-variables)
- [Database & seeding](#database--seeding)
- [Backend API](#backend-api)
- [Frontend app](#frontend-app)
- [Tests](#tests)
- [Security & OWASP controls](#security--owasp-controls)
- [Documentation index](#documentation-index)

---

## System overview & roles

The platform has three primary user personas, each with a dedicated portal in the web app:

| Role | Description | Web portal |
| :--- | :--- | :--- |
| **FARMER** | Agricultural producer / regular consumer. Browses the shop, gets disease advisories, orders inputs. | `FARMER` (/farmer) + public shop |
| **VENDOR** | Authorized regional agro-supplier & depot. Manages assigned inventory units, dispatch, and metrics. | `VENDOR` (/vendor) |
| **ADMIN** | Platform administrator. Manages the product catalog, advisory matrix, vendor approvals, orders, and audit logs. | `ADMIN` (/admin) |

### Critical role governance rules

1. **Public registration** always assigns the `FARMER` role. Any client-supplied `role` claim (e.g. `ADMIN` or `VENDOR`) is ignored.
2. **Vendor accounts** can only be created and activated by an administrator.
3. **Catalog rule** — vendors cannot create global store products; admins create the global catalog and vendors manage their allocated inventory units.
4. **Vendor profile changes** (entity/banking details) require approval through the `vendor_change_requests` queue.
5. **Object-level isolation** — farmers can only view/cancel their own orders and scan records.

---

## Architecture

```text
React Web Storefront (Vite)          Flutter Mobile App (separate repo)
        |                                      |
        |  Bearer JWT                           |  Google SSO
        v                                      v
             FastAPI (app/main.py)
             ├── SecurityHeadersMiddleware (OWASP headers)
             ├── CORSMiddleware
             ├── Auth middleware (core/security.py)
             │      └── Decode & validate Supabase JWT (sub, exp, iss, aud)
             ├── RBAC & object ownership (auth/permissions.py)
             │      ├── FARMER → orders, scan history, addresses, cart
             │      ├── VENDOR → inventory, dispatch, metrics
             │      └── ADMIN  → catalog, advisory matrix, approvals, audit
             └── Async SQLAlchemy 2.0 (+ Alembic)
                      └── PostgreSQL (Supabase) / SQLite (dev)
```

The **frontend** talks to the backend via an axios client that:
- attaches the JWT from `localStorage` (`kafaas_auth_token`),
- transforms request payloads to `snake_case` and responses to `camelCase`
  (see `src/utils/caseTransform.ts`),
- routes through Vite's proxy (`/api/v1` → backend) in development.

When no `VITE_API_BASE_URL` is configured, the frontend falls back to **mock data** (`src/api/mockData.ts`) so the UI can be developed without the backend running.

---

## Repository layout

```
D:\kafaas
├── index.html                  # Vite HTML entry
├── index.css / src/style.css   # global styles
├── vite.config.ts              # Vite + React + Tailwind config
├── tailwind.config.js
├── tsconfig.json
├── package.json
│
├── src/                        # ── FRONTEND ──
│   ├── main.tsx                # React entry
│   ├── App.tsx                 # Router + route table + error boundary
│   ├── api/                    # axios API layer (auth, cart, products, orders…)
│   ├── components/             # common, auth, layout, orders, recommendations, shop
│   ├── hooks/                  # useAuth, useCart, useOrders, useProducts…
│   ├── layouts/                # Public / Farmer / Vendor / Admin shells
│   ├── pages/                  # page components (public, auth, farmer, vendor, admin)
│   ├── stores/                 # zustand stores (auth, cart, ui)
│   ├── types/                  # TypeScript domain types
│   └── utils/                  # caseTransform (camelCase/snake_case)
│
└── kafaas_backend/             # ── BACKEND ──
    ├── app/
    │   ├── main.py             # FastAPI app, lifespan, middleware, docs
    │   ├── core/               # config, database, security, logging
    │   ├── auth/               # router, service, dependencies, permissions
    │   ├── api/v1/             # versioned routers (users, products, cart, …)
    │   ├── models/             # SQLAlchemy models (user, order, inventory…)
    │   ├── schemas/            # Pydantic schemas
    │   ├── db/                 # seed.py (default data) + alembic
    │   └── migrations
    ├── tests/                  # pytest suite
    ├── alembic.ini
    ├── requirements.txt
    └── .env.example
```

---

## Quick start

### Prerequisites

- **Node.js** (>= 20) and npm — for the frontend
- **Python 3.12+** — for the backend
- Optional: PostgreSQL or a Supabase project (SQLite is used locally by default)

### 1. Backend

```bash
cd kafaas_backend

# create & activate a virtual environment
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS/Linux

# install dependencies
pip install -r requirements.txt

# copy the sample env (edit to taste)
copy .env.example .env

# run the server (schema + seed data are auto-created on startup)
uvicorn app.main:app --port 8000 --reload
```

Verify:
- Health: <http://localhost:8000/health>
- API root: <http://localhost:8000/>
- **Swagger UI**: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

### 2. Frontend

```bash
cd D:\kafaas
npm install
npm run dev
```

Open <http://localhost:5173>. The frontend reaches the backend at `http://localhost:8000/api/v1` (set via `VITE_API_BASE_URL` in `.env`).

### 3. Run the tests

```bash
cd kafaas_backend
pytest -v
```

---

## Demo accounts

Seed data is created automatically on backend startup. Use these to test each role:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@kafaas.com` | `Farmer@12345` | `FARMER` |
| **Vendor** | `vendor@kafaas.com` | `Vendor@12345` | `VENDOR` |
| **Admin** | `admin@kafaas.com` | `Admin@12345` | `ADMIN` |

---

## Environment variables

### Frontend (`.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend API prefix. When empty, mock data is used. | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | Display name used in the UI. | `KaFaaS` |

### Backend (`kafaas_backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_ENV` | `development` or `production` | `development` |
| `APP_NAME` | App title | `KaFaaS Backend` |
| `DEBUG` | Enable debug CORS (`*`) | `true` |
| `PORT` | Uvicorn port | `8000` |
| `DATABASE_URL` | Async SQLAlchemy DB URL | `sqlite+aiosqlite:///./kafaas.db` |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_ANON_KEY` | Supabase anon key | — |
| `SUPABASE_JWT_SECRET` | JWT signing secret | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only) | — |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,…` |
| `RATE_LIMIT_PER_MINUTE` | Auth rate limit | `120` |

> ⚠️ **Secrets** — remember to set real `SUPABASE_*` values in production and **never commit** production keys. The checked-in values are dev placeholders.

---

## Database & seeding

- SQLAlchemy models are in `kafaas_backend/app/models/`.
- On startup, `app/main.py` runs `Base.metadata.create_all` and then `seed_database()` (`app/db/seed.py`).
- Seeding is **idempotent**: if an `ADMIN` role already exists it skips re-seeding.
- Migrations are managed with **Alembic** (`kafaas_backend/alembic.ini`, `app/migrations`).

Seed data includes: roles + permissions (RBAC), the three demo users, the global product catalog (12 agrochemical products), categories, crops & diseases, the recommendation advisory matrix, a sample order, system settings, and an audit log entry.

### Core domain models

| Model | Purpose |
| :--- | :--- |
| `User`, `Role`, `Permission` | Users and RBAC |
| `Address`, `UserPreference` | Farmer profile data |
| `Category`, `Product`, `ProductSpecification` | Global catalog |
| `VendorProfile`, `VendorInventory`, `VendorChangeRequest` | Vendors & stock |
| `Order`, `OrderItem`, `OrderTrackingEvent` | Order lifecycle |
| `Crop`, `CropDisease`, `DiseaseRecommendation`, `RecommendedProductItem` | Advisory system |
| `FarmerScanHistory` | Scanned-disease history |
| `AuditLog` | Security/admin audit trail |
| `SystemSetting` | Configurable thresholds (delivery fee, subsidy, GST) |

---

## Backend API

All API routes are mounted under **`/api/v1`**.

### Auth (`/auth`)

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/auth/register` | Public farmer registration (role forced to `FARMER`) |
| POST | `/auth/login` | Email/password login → access token + role + permissions |
| POST | `/auth/sso/callback` | Google SSO token exchange (Supabase) |
| GET | `/auth/me` | Current user profile & permissions |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Set new password with reset token |
| POST | `/auth/logout` | Audit-logged logout |

### Users (`/users`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/users/me` | Current user details |
| PUT | `/users/me` | Update current profile |
| GET/POST | `/users/addresses` | List / add addresses |
| PUT/DELETE | `/users/addresses/{id}` | Update / delete an address |
| PUT | `/users/addresses/{id}/default` | Mark an address as default |
| PUT | `/users/preferences` | Update user preferences |

### Products (`/products`) & Categories (`/categories`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/products` | Paginated product catalog |
| GET | `/products/featured` | Featured products |
| GET | `/products/{id}` | Product detail |
| GET | `/products/{id}/related` | Related products |
| POST | `/products` | Create product (**admin**) |
| PUT/DELETE | `/products/{id}` | Update / delete product (**admin**) |
| GET | `/categories` | List categories |

### Cart (`/cart`)

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/cart/calculate` | **Authoritative** pricing calculation (volume discount, Kisan subsidy, delivery fee, 5% GST) |

### Orders (`/orders`)

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/orders` | Create an order |
| GET | `/orders` | List own orders |
| GET | `/orders/{id}` | Order detail + tracking timeline |
| POST | `/orders/{id}/cancel` | Cancel an eligible order |
| PUT | `/orders/{id}/status` | Advance order state (**admin/vendor**) |

### Inventory (`/inventory`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/inventory/vendor` | Vendor's assigned inventory |
| GET | `/inventory/admin` | All warehouse inventory (**admin**) |
| POST | `/inventory/adjust` | Stock adjustment / restock |
| GET | `/inventory/transactions` | Transaction history |

### Vendors (`/vendors`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/vendors/metrics` | Vendor dashboard metrics |
| GET/POST | `/vendors/change-requests` | List / submit profile change requests |

### Admin (`/admin`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/admin/metrics` | Admin dashboard metrics |
| GET | `/admin/users` | List all users |
| GET | `/admin/vendor-requests` | List pending vendor requests |
| PUT | `/admin/vendor-requests/{id}` | Approve / reject a vendor request |
| GET/PUT | `/admin/settings` | Read / update system settings |

### Recommendations (`/`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/crops` | List crops |
| GET | `/diseases` | List crop diseases |
| GET | `/recommendations` | List advisory matrix |
| GET | `/recommendations/lookup` | Look up a recommendation (crop + disease) |
| GET/POST | `/farmer/scans` | List / create scanned disease history |
| PUT | `/admin/recommendations/{id}` | Update a recommendation (**admin**) |

### Audit (`/audit`) & Weather (`/weather`)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/audit/logs` | Security/administrative audit trail |
| GET | `/weather/forecast` | Agri weather advisory |

> The full, interactive specification is always available at **<http://localhost:8000/docs>**.

---

## Frontend app

### Routing (`src/App.tsx`)

Public routes (no auth): `/`, `/shop`, `/products/:id`, `/cart`, `/recommendations`, `/about`, plus auth pages.

Protected portal routes (guarded by `ProtectedRoute` / `RoleProtectedRoute`):

| Portal | Prefix | Access |
| :--- | :--- | :--- |
| Farmer | `/farmer` (dashboard, orders, addresses, recommendations, scans, profile) | `farmer`, `admin` |
| Vendor | `/vendor` (dashboard, inventory, orders, sales, profile) | `vendor`, `admin` |
| Admin | `/admin` (dashboard, products, inventory, orders, recommendations, users, vendor-requests, audit-logs, settings) | `admin` |

### Key modules

| Module | Purpose |
| :--- | :--- |
| `src/api/*` | Typed axios API client per domain |
| `src/stores/*` | Zustand slices: `authStore`, `cartStore`, `uiStore` |
| `src/hooks/*` | React Query wrappers (`useAuth`, `useCart`, `useProducts`, …) |
| `src/components/common/*` | Reusable UI primitives (Button, Input, Modal, Badge, …) |
| `src/layouts/*` | Per-role shell layouts (nav + footer) |
| `src/utils/caseTransform.ts` | camelCase ↔ snake_case serialization |

### Styling

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin).
- `clsx` + `tailwind-merge` for conditional class composition.
- Icons from `lucide-react`.

---

## Tests

Backend test suite (`kafaas_backend/tests/`) covers:

| File | Coverage |
| :--- | :--- |
| `test_auth.py` | Registration, duplicate emails, login, auth/me, invalid JWT |
| `test_authorization.py` | RBAC denials, admin access, object-level isolation |
| `test_cart_and_orders.py` | Authoritative cart calculation, order create/cancel |
| `test_recommendations.py` | Crops/diseases list, recommendation lookup, scan history |
| `test_role_escalation.py` | Registration ignores client-supplied role; forged JWT rejected |

Run with:

```bash
cd kafaas_backend
pytest -v
```

---

## Security & OWASP controls

Implemented in the backend:

- **A01 – Broken Access Control**: server-side RBAC + object-ownership checks; deny-by-default.
- **A02 – Cryptographic Failures**: bcrypt password hashing (≥12 rounds), standard JWT signature verification.
- **A03 – Injection**: async SQLAlchemy parameterized queries + Pydantic v2 validation.
- **A04 – Insecure Design**: authoritative server-side cart pricing (no client price manipulation).
- **A05 – Security Misconfiguration**: configurable CORS, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), debug disabled in production.
- **A07 – Authentication Failures**: Supabase JWT verification, account status checks (`PENDING`/`ACTIVE`/`SUSPENDED`/`DISABLED`), rate-limiting readiness.
- **A09 – Security Logging**: immutable `audit_logs` table for security/administrative events.

---

## Documentation index

| Document | Location |
| :--- | :--- |
| **Project overview (this file)** | `README.md` |
| Frontend architecture & developer guide | `docs/frontend.md` |
| Backend technical reference | `docs/backend.md` |
| Backend-specific README | `kafaas_backend/README.md` |
| Agent/domain docs | `docs/agents/` |
| Agent instructions | `AGENTS.md` |

---


