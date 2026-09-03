# 02: Verify CORS configuration allows frontend origin

**What to build:** Confirm the backend CORS middleware permits requests from the frontend dev server (`http://localhost:5173`) so API calls and docs access work cross-origin.

**Blocked by:** 01-verify-backend-running

**Status:** done

- [x] Check `CORS_ORIGINS` in `kafaas_backend/.env` includes `http://localhost:5173`
- [x] Verify `app/main.py` CORS middleware uses `CORS_ORIGINS` from settings
- [x] Test preflight OPTIONS request from frontend origin to `/docs` - success
- [x] Test actual API call from frontend origin to `/api/v1/auth/login` - success
- [x] Confirm no CORS errors - CORS headers present and correct