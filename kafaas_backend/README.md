# KaFaaS (Kavir Fasal Sarthi) - Enterprise Backend

Production-grade FastAPI backend for the **KaFaaS** agricultural technology and e-commerce platform. Built with **FastAPI**, **PostgreSQL / Supabase**, **Supabase Auth + JWT Security**, **Async SQLAlchemy 2.0 + Alembic**, and a comprehensive **Role-Based Access Control (RBAC)** architecture.

---

## 🏛️ Architecture Overview

```text
Flutter Mobile App / React Web Storefront
                  |
                  | 1. Authenticate (Email/Password or Google SSO)
                  v
            Supabase Auth
                  |
                  | 2. Signed Bearer JWT Token
                  v
     FastAPI Authentication Middleware (app/core/security.py)
                  |
                  +--> Decode & Validate Signature (SUPABASE_JWT_SECRET)
                  +--> Verify Expiration (exp), Issuer (iss), Audience (aud)
                  +--> Extract Subject UUID (sub)
                  |
                  v
       Application RBAC & Object Ownership (app/auth/permissions.py)
                  |
                  +--> FARMER APIs    (Orders, Scan History, Addresses, Cart)
                  +--> VENDOR APIs    (Assigned Inventory, Dispatch, Metrics)
                  +--> ADMIN APIs     (Product Catalog CRUD, Advisory Matrix, Approvals)
                  |
                  v
   PostgreSQL Database (Supabase) via Async SQLAlchemy
```

---

## 👥 User Roles & Permission Matrix

| Role | Description | Default Permissions |
| :--- | :--- | :--- |
| **`FARMER`** | Agricultural producer / regular consumer | `user:read_self`, `user:update_self`, `product:read`, `cart:read`, `cart:write`, `order:create`, `order:read_self`, `order:cancel_self` |
| **`VENDOR`** | Authorized regional supplier & depot | `user:read_self`, `user:update_self`, `product:read`, `vendor:read_self`, `vendor:update_self`, `vendor:submit_change`, `inventory:read`, `inventory:update` |
| **`ADMIN`** | System administrator | Full operational permissions (`admin:user_manage`, `admin:vendor_manage`, `admin:product_manage`, `admin:inventory_manage`, `admin:order_manage`, `admin:audit_read`, etc.) |

### Critical Role Governance Rules:
1. **Public Registration**: Strictly assigns `FARMER` role. Any client attempt to inject `"role": "ADMIN"` or `"role": "VENDOR"` is disregarded.
2. **Vendor Provisioning**: Vendor accounts can only be created and activated by an Administrator.
3. **Vendor Catalog Rule**: Vendors **cannot** create global store products (Admin creates global catalog; Vendors manage allocated inventory units).
4. **Vendor Profile Change Approval**: Vendor profile or banking modifications require approval via the `vendor_change_requests` queue.
5. **Object-Level Isolation**: Farmers can only view/cancel their own orders and scan records.

---

## 🔐 Authentication & Google SSO Integration

### Flutter Mobile App Google SSO Configuration:
- **Android Package**: `com.kafaas.kafaas_mobile_app`
- **Configured Callback**: `https://owaaxzfmsncgcmwrzqzq.supabase.co/auth/v1/callback`
- **Debug SHA-1**: `E0:EA:99:A4:98:21:E5:BA:FF:60:38:D7:C9:B3:06:F2:1B:26:5D:A6`

### SSO Token Exchange Flow:
1. Flutter application logs in with Google via Supabase Auth SDK.
2. Flutter app receives access token and sends it in `Authorization: Bearer <token>` to FastAPI.
3. FastAPI's `get_current_user` dependency verifies the token and maps `sub` to the PostgreSQL `users` table. If it is a new user, it automatically provisions an active `FARMER` profile in the application database.

---

## 📦 Demo Accounts (Pre-Seeded)

| Persona | Email | Password | Assigned Role |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@kafaas.com` | `Farmer@12345` | `FARMER` (`KISAN-MP-2024-8841`) |
| **Vendor** | `vendor@kafaas.com` | `Vendor@12345` | `VENDOR` (`AgroTech Solutions Indore`) |
| **Admin** | `admin@kafaas.com` | `Admin@12345` | `ADMIN` (`Rajesh Sharma`) |

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.12+
- PostgreSQL (or local SQLite fallback)

### 2. Setup Environment
```bash
# In d:\kafaas\kafaas_backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```env
APP_ENV=development
APP_NAME=KaFaaS Backend
DEBUG=true
PORT=8000

# Database URL (PostgreSQL / Supabase or local SQLite)
DATABASE_URL=sqlite+aiosqlite:///./kafaas.db

# Supabase Auth
SUPABASE_URL=https://owaaxzfmsncgcmwrzqzq.supabase.co
SUPABASE_JWT_SECRET=super_secret_jwt_key_for_kafaas_supabase_2026
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### 4. Run Development Server
```bash
uvicorn app.main:app --port 8000 --reload
```

- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🧪 Running Automated Tests

The test suite validates authentication, RBAC authorization, role escalation prevention, object-level ownership checks, authoritative cart pricing, and disease advisory matrices.

```bash
# In d:\kafaas\kafaas_backend
pytest -v
```

---

## 🛡️ OWASP Security Controls Implemented

- **A01 Broken Access Control**: Strict server-side RBAC + Object-level ownership validation (`check_resource_ownership`). Deny-by-default.
- **A02 Cryptographic Failures**: Bcrypt password hashing (minimum 12 rounds), standard JWT signature verification with secret protection.
- **A03 Injection Prevention**: Async SQLAlchemy parameterized queries and Pydantic v2 data validation throughout.
- **A04 Insecure Design**: Authoritative server-side price computation (`/api/v1/cart/calculate`) preventing client price manipulation.
- **A05 Security Misconfiguration**: Configurable CORS origins, security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), and debug disablement in production.
- **A07 Authentication Failures**: Supabase Auth token verification, account status checks (`PENDING`, `ACTIVE`, `SUSPENDED`, `DISABLED`), and rate limiting readiness.
- **A09 Security Logging**: Centralized immutable audit logging (`audit_logs` table) for all security and administrative events.
