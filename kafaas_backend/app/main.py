from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.core.database import engine, Base
from app.api.v1.router import api_v1_router
from app.db.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager. Initializes database schema and seeds default data on startup."""
    try:
        logger.info("Initializing KaFaaS database schema...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Verifying initial seed data...")
        await seed_database()
        logger.info("KaFaaS Backend started successfully.")
    except Exception as e:
        logger.error(f"Startup error: {e}", exc_info=True)
    yield
    logger.info("Shutting down KaFaaS Backend...")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add secure HTTP response headers according to OWASP standards."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-grade e-commerce and crop disease advisory backend for Indian agriculture.",
    docs_url=None,  # Custom handler with fast CDN mirrors below
    redoc_url=None,
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# 1. Add Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 2. Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True if settings.CORS_ORIGINS else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 3. Custom Robust Swagger Documentation
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{settings.APP_NAME} - Interactive API Docs",
        swagger_js_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        swagger_css_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        swagger_ui_parameters={
            "persistAuthorization": True,
            "displayRequestDuration": True,
            "filter": True,
            "tryItOutEnabled": True,
        },
    )


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{settings.APP_NAME} - ReDoc",
        redoc_js_url="https://cdnjs.cloudflare.com/ajax/libs/redoc/2.1.3/redoc.standalone.min.js",
    )


# 4. Global Safe Error Handler (only catches 500s on API routes, leaves docs intact)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


# 5. Mount Master API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "kafaas_backend"}
