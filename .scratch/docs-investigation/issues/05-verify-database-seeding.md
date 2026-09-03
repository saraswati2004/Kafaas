# 05: Verify database connectivity and seeding

**What to build:** Confirm the backend can connect to its SQLite database, run migrations, and seed demo accounts so authenticated API calls work.

**Blocked by:** 01-verify-backend-running

**Status:** done

- [x] Check `kafaas_backend/.env` has `DATABASE_URL=sqlite+aiosqlite:///./kafaas.db` - confirmed
- [x] Verify `app/core/database.py` creates async engine correctly - works
- [x] Verify `app/db/seed.py` seeds demo accounts - accounts exist and work
- [x] Run `alembic upgrade head` to ensure migrations apply - tables exist
- [x] Test login via `/api/v1/auth/login` with demo credentials - farmer login works
- [x] Verify JWT token returned and can be used for authenticated requests - token works for `/api/v1/users/me`