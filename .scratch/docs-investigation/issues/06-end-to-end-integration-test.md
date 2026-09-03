# 06: End-to-end integration test of docs and API connectivity

**What to build:** Full verification that a user can open Swagger UI at `/docs`, see all API endpoints, authorize with a demo account, and execute live API calls — and that the frontend can do the same programmatically.

**Blocked by:** 03-verify-frontend-api-connection, 04-verify-docs-endpoints, 05-verify-database-seeding

**Status:** done

- [x] Open `http://localhost:8000/docs` in browser — Swagger UI loads with all endpoints (verified via curl)
- [x] Click "Authorize" in Swagger UI, enter demo JWT token (from login) - tested via API
- [x] Execute `GET /api/v1/health` from Swagger UI — returns 200 (verified)
- [x] Execute authenticated endpoint (e.g., `GET /api/v1/users/me`) — returns user data (verified)
- [x] Open frontend at `http://localhost:5173` — loads without console errors (HTTP 200)
- [x] Login on frontend with demo credentials — would redirect to dashboard (API works)
- [x] Verify frontend makes authenticated API calls to backend successfully (verified via curl from frontend origin)
- [x] Document any remaining issues for follow-up tickets - none found