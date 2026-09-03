# 04: Verify custom Swagger/ReDoc endpoints are properly configured

**What to build:** Confirm the custom `/docs` and `/redoc` routes in `app/main.py` correctly serve Swagger UI and ReDoc with the right OpenAPI spec URL, and that they're not blocked by middleware or exception handlers.

**Blocked by:** 01-verify-backend-running

**Status:** done

- [x] Check `app/main.py` lines 64-88: custom `custom_swagger_ui_html` and `redoc_html` functions - verified
- [x] Verify `openapi_url` points to correct spec endpoint (`/openapi.json`) - correct
- [x] Verify `swagger_js_url`, `swagger_css_url`, `redoc_js_url` use accessible CDN URLs - CDN URLs work
- [x] Confirm `include_in_schema=False` prevents docs from appearing in their own spec - confirmed
- [x] Test that global exception handler (lines 91-98) doesn't catch docs routes - docs return 200
- [x] Verify SecurityHeadersMiddleware doesn't block docs HTML responses - headers present but allow HTML