import os
from typing import List
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

IS_VERCEL = os.environ.get("VERCEL") is not None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env" if not IS_VERCEL else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "production" if IS_VERCEL else "development"
    APP_NAME: str = "KaFaaS Backend"
    DEBUG: bool = not IS_VERCEL
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # Database — Vercel serverless uses /tmp for ephemeral SQLite
    DATABASE_URL: str = (
        "sqlite+aiosqlite:///./kafaas.db"
        if not IS_VERCEL
        else "sqlite+aiosqlite:////tmp/kafaas.db"
    )

    # Supabase Credentials
    SUPABASE_URL: str = "https://owaaxzfmsncgcmwrzqzq.supabase.co"
    SUPABASE_ANON_KEY: str = "dummy_anon_key"
    SUPABASE_JWT_SECRET: str = "super_secret_jwt_key_for_kafaas_supabase_2026"
    SUPABASE_SERVICE_ROLE_KEY: str = "dummy_service_role_key_dev_only"

    # Mobile SSO References
    GOOGLE_ANDROID_PACKAGE: str = "com.kafaas.kafaas_mobile_app"

    # Security
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS_RAW: str = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
        if not IS_VERCEL
        else ""
    )
    RATE_LIMIT_PER_MINUTE: int = 120

    @computed_field
    def CORS_ORIGINS(self) -> List[str]:
        if not self.CORS_ORIGINS_RAW:
            return ["http://localhost:5173"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    @computed_field
    def IS_PRODUCTION(self) -> bool:
        return self.APP_ENV.lower() == "production"


settings = Settings()
