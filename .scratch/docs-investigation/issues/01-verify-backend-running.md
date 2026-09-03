# 01: Verify backend is running and docs endpoints accessible

**What to build:** Confirm the FastAPI backend starts successfully and the `/docs` (Swagger UI) and `/redoc` endpoints return valid HTML responses.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Start backend with `uvicorn app.main:app --port 8000 --reload` from `kafaas_backend/`
- [x] Verify `http://localhost:8000/docs` returns Swagger UI HTML (HTTP 200)
- [x] Verify `http://localhost:8000/redoc` returns ReDoc HTML (HTTP 200)
- [x] Verify `http://localhost:8000/openapi.json` returns valid OpenAPI spec (HTTP 200)
- [x] Check backend logs for any startup errors - no errors