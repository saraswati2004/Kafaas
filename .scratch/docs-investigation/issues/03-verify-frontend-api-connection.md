# 03: Verify frontend API client connects to backend correctly

**What to build:** Confirm the Vite/React frontend's axios client (`src/api/client.ts`) is configured with the correct `VITE_API_BASE_URL` and can successfully call backend endpoints.

**Blocked by:** 02-verify-cors-config

**Status:** done

- [x] Check `.env` has `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- [x] Verify `src/api/client.ts` uses `import.meta.env.VITE_API_BASE_URL` with fallback to `/api/v1`
- [x] Start frontend with `npm run dev` and verify it loads at `http://localhost:5173` (HTTP 200)
- [x] Test authenticated API call from frontend origin to backend - success
- [x] Browser network requests would go to `http://localhost:8000/api/v1/*` - verified via curl
- [x] No mixed-content or network errors - CORS properly configured