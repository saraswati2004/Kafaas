import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.db.seed import seed_database
from app.models.user import User, AccountStatusEnum

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_kafaas.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Initializes the database schema and seeds sample data once per test session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Seed data using test database session factory
    await seed_database(session_factory=TestingSessionLocal)
    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    """Provides a transactional database session for tests."""
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    """Asynchronous HTTP test client with overridden database dependency."""
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def farmer_auth_headers():
    """Auth headers for authenticated farmer (Ramesh Patel)."""
    token = create_access_token(
        data={
            "sub": "auth-farmer-uuid-0001",
            "email": "farmer@kafaas.com",
            "role": "FARMER",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def vendor_auth_headers():
    """Auth headers for authorized vendor (Suresh Verma)."""
    token = create_access_token(
        data={
            "sub": "auth-vendor-uuid-0001",
            "email": "vendor@kafaas.com",
            "role": "VENDOR",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers():
    """Auth headers for platform administrator (Rajesh Sharma)."""
    token = create_access_token(
        data={
            "sub": "auth-admin-uuid-0001",
            "email": "admin@kafaas.com",
            "role": "ADMIN",
        }
    )
    return {"Authorization": f"Bearer {token}"}
