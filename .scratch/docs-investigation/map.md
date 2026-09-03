# docs-investigation: Map

## Notes

Investigating why KaFaaS backend docs (`/docs`, `/redoc`) appear not working and whether frontend-backend connectivity is functional.

## Decisions-so-far

- Backend is FastAPI with custom Swagger/ReDoc routes in `app/main.py`
- Frontend is Vite+React with axios client pointing to `VITE_API_BASE_URL`
- Local SQLite database by default, demo accounts pre-seeded
- CORS configured for `http://localhost:5173` (Vite default)

## Tickets

| # | Ticket | Status | Blocked by |
|---|--------|--------|------------|
| 01 | verify-backend-running | **done** | — |
| 02 | verify-cors-config | **done** | 01 |
| 03 | verify-frontend-api-connection | **done** | 02 |
| 04 | verify-docs-endpoints | **done** | 01 |
| 05 | verify-database-seeding | **done** | 01 |
| 06 | end-to-end-integration-test | **done** | 03, 04, 05 |

## Resolution

All checks pass. The backend docs (`/docs`, `/redoc`, `/openapi.json`) are working correctly. The frontend connects to the backend successfully with proper CORS configuration. Demo accounts are seeded and authentication works end-to-end.