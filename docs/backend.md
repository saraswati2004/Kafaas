# KaFaaS Backend — Technical Reference

Production-grade **FastAPI** backend for the KaFaaS agricultural platform.
Built with **PostgreSQL / Supabase** (SQLite in dev), **Supabase Auth + JWT security**, **async SQLAlchemy 2.0 + Alembic**, and a comprehensive **RBAC** architecture.

> The existing `kafaas_backend/README.md` covers the overview, demo accounts, quick start, and OWASP controls. This document is the deeper technical reference for developers extending the backend.

---

## Tech stack

| Concern | Library |
| :--- | :--- |
| Web framework | FastAPI ≥0.115 |
| ASGI server | uvicorn |
| Validation / config | Pydantic v2, pydantic-settings |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Database | PostgreSQL / Supabase (`asyncpg`) or SQLite (`aiosqlite`) |
| Auth | Supabase Auth, python-jose / PyJWT, bcrypt |
| Tests | pytest, pytest-asyncio |

---

## Source layout (`kafaas_backend/app`)

```
app/
├── main.py             # app factory, lifespan, middleware, custom Swagger/ReDoc, error handler
├── core/
│   ├── config.py       # pydantic-settings (all env vars)
│   ├── database.py     # async engine, session factory, get_db dependency
│   ├── security.py     # JWT decode/create, password hashing
│   └── logging.py      # logger
├── auth/
│   ├── router.py       # /auth endpoints
│   ├── service.py      # register_farmer, authenticate_user, SSO sync, audit
│   ├── dependencies.py # get_current_user / get_current_active_user
│   └── permissions.py  # RBAC permission names & checks
├── api/v1/             # versioned domain routers
├── models/             # SQLAlchemy ORM models
├── schemas/            # Pydantic request/response schemas
├── db/
│   ├── seed.py         # default roles, users, catalog, advisory matrix
│   └── alembic/        # migrations
```

---

## Application lifecycle (`app/main.py`)

On **startup** (`lifespan`):
1. `Base.metadata.create_all` creates all tables.
2. `seed_database()` seeds default data (idempotent — skips if an `ADMIN` role already exists).

Middleware (order of execution):
- `SecurityHeadersMiddleware` → adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- FastAPI `CORSMiddleware` → `allow_origins=["*"]` in dev, `settings.CORS_ORIGINS` in production.

Docs: `/docs` (custom Swagger UI via CDN), `/redoc`, OpenAPI at `/openapi.json`.
Health: `GET /` and `GET /health`.

All API routes are mounted under **`/api/v1`** (see `app/api/v1/router.py`).

---

## Configuration (`app/core/config.py`)

Loaded from `kafaas_backend/.env` (see the root `README.md` for the full env table). Highlights:

| Setting | Default | Notes |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | `IS_PRODUCTION` is true only when `production` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./kafaas.db` | Swap to Postgres in production |
| `JWT_ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | |
| `CORS_ORIGINS_RAW` | localhost origins | parsed into `CORS_ORIGINS` list |
| `RATE_LIMIT_PER_MINUTE` | `120` | |

---

## Data model

Models are registered in `app/models/__init__.py`.

### Identity & access

**`users`** — `id`, `auth_user_id` (Supabase `sub`), `email` (unique), `full_name`, `phone`, `avatar_url`, `kisan_id` (unique), `status` (`AccountStatusEnum`), `hashed_password`, timestamps.
- `primary_role` property → `ADMIN > VENDOR > FARMER`.
- `permissions_set` property → union of all permission names across roles.

**`roles`**, **`permissions`** + association tables `user_roles`, `role_permissions`.
Roles: `FARMER`, `VENDOR`, `ADMIN`. Each role carries a set of `name`-scoped permissions (e.g. `product:read`, `order:create`, `admin:user_manage`).

**`addresses`** — Farmer delivery/farm-gate addresses (with `is_default`, `address_type`).
**`user_preferences`** — language, notifications, `preferred_crops` (JSON).

### Catalog

**`categories`**, **`products`**, **`product_specifications`** — global catalog managed by admins.

### Vendors & inventory

**`vendor_profiles`** — business/warehouse/banking details, `approval_status`.
**`vendor_inventory`** — per-vendor stock (`available_stock`, `reserved_stock`, `low_stock_threshold`, `warehouse_location`).
**`inventory_transactions`** — stock movements (adjust/restock history).
**`vendor_change_requests`** — queue for vendor profile/banking amendments requiring admin approval.

### Orders

**`orders`** — shipping address (JSON), authoritative pricing (JSON), status/payment state machine, vendor reference, delivery estimates.
**`order_items`** — line items (snapshot of product/brand/price/quantity at purchase).
**`order_tracking_events`** — timeline (pending → confirmed → processing → shipped → delivered).

### Advisory system

**`crops`**, **`crop_diseases`**, **`disease_recommendations`**, **`recommended_product_items`** — the crop-disease → recommended-product advisory matrix.
**`farmer_scan_history`** — a farmer's scanned-disease records.

### Audit & settings

**`audit_logs`** — immutable security/administrative event log.
**`system_settings`** — key/value thresholds (`free_delivery_minimum`, `kisan_subsidy_amount`, `agri_gst_percent`, etc.).

---

## Authentication & authorization

### Flow

1. Client authenticates (email/password via `POST /auth/login`, or Google SSO via Supabase).
2. Backend verifies credentials / decodes the Supabase JWT and issues an application `Bearer` access token.
3. `get_current_active_user` (in `app/auth/dependencies.py`) decodes the JWT, verifies `sub`/`iss`/`aud`/`exp`, loads the user, and checks account status.
4. Route-level or service-level **permission checks** enforce RBAC (deny-by-default).

### Roles & permissions

See the matrix in `kafaas_backend/README.md`. Key governance rules:

- Public registration → role always `FARMER`; client-supplied roles are ignored.
- Vendor accounts are provisioned only by admins.
- Vendors cannot create global products; admins own the catalog.
- Vendor profile/banking changes go through the `vendor_change_requests` approval queue.
- Object-level isolation: farmers access only their own orders/scans/addresses.

---

## Adding a new endpoint

1. Add a Pydantic schema to `app/schemas/<domain>.py`.
2. Add ORM queries/logic in a new or existing router under `app/api/v1/<domain>.py`.
3. Register the router in `app/api/v1/router.py`.
4. Apply the correct auth dependency (`Depends(get_current_active_user)`) and permission checks.
5. Add tests in `kafaas_backend/tests/`.

---

## Testing

```bash
cd kafaas_backend
pytest -v
```

- Fixtures live in `tests/conftest.py` and build/test against an isolated SQLite DB (`test_kafaas.db`), seeding it per test.
- See the root `README.md` for the test-coverage table.

> 💡 If seed data ever looks incomplete, verify `app/db/seed.py` — the permission list must contain every permission that roles reference (a common failure is a `KeyError` when a role references a permission that was never seeded).

---

## Security notes

- **Never commit real `SUPABASE_*` secrets.** The checked-in values are dev placeholders.
- In production set `APP_ENV=production` (disables permissive CORS) and use PostgreSQL.
- Run Alembic migrations in production instead of relying on `create_all`.
