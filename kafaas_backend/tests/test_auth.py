import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_farmer_success(client: AsyncClient):
    """Test farmer registration returns 201 and assigns FARMER role."""
    payload = {
        "email": "new.farmer@kafaas.com",
        "password": "SecurePassword123!",
        "full_name": "Sita Devi",
        "phone": "+91 98221 55443",
        "kisan_id": "KISAN-MP-2026-9901",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new.farmer@kafaas.com"
    assert data["user"]["full_name"] == "Sita Devi"
    assert data["user"]["role"] == "FARMER"


@pytest.mark.asyncio
async def test_register_duplicate_email_rejected(client: AsyncClient):
    """Test that registering an existing email returns 409 Conflict."""
    payload = {
        "email": "farmer@kafaas.com",  # Already seeded
        "password": "SecurePassword123!",
        "full_name": "Duplicate Farmer",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test login with valid seeded credentials."""
    payload = {
        "email": "farmer@kafaas.com",
        "password": "Farmer@12345",
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "farmer@kafaas.com"
    assert data["user"]["role"] == "FARMER"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    """Test login with incorrect password returns 401."""
    payload = {
        "email": "farmer@kafaas.com",
        "password": "WrongPassword!",
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_auth_me_authenticated(client: AsyncClient, farmer_auth_headers: dict):
    """Test /auth/me returns profile for valid JWT."""
    response = await client.get("/api/v1/auth/me", headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "farmer@kafaas.com"
    assert data["role"] == "FARMER"
    assert "order:create" in data["permissions"]


@pytest.mark.asyncio
async def test_auth_me_unauthenticated(client: AsyncClient):
    """Test /auth/me without bearer token returns 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_invalid_jwt(client: AsyncClient):
    """Test invalid or tampered JWT returns 401."""
    headers = {"Authorization": "Bearer invalid_tampered_token_string"}
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
