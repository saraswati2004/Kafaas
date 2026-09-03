import pytest
from httpx import AsyncClient
import jwt
from app.core.config import settings


@pytest.mark.asyncio
async def test_registration_ignores_client_supplied_role(client: AsyncClient):
    """
    Test role escalation prevention: A registration payload containing 'role': 'ADMIN'
    must not elevate privileges. The created user must strictly be a FARMER.
    """
    payload = {
        "email": "hacker@example.com",
        "password": "HackerPassword123!",
        "full_name": "Mr. Hacker",
        "role": "ADMIN",  # Attempted escalation
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "FARMER"

    # Verify that the generated token cannot access admin APIs
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    admin_resp = await client.get("/api/v1/admin/metrics", headers=headers)
    assert admin_resp.status_code == 403


@pytest.mark.asyncio
async def test_forged_jwt_signature_rejected(client: AsyncClient):
    """
    Test that a JWT signed with a bogus secret is rejected with 401.
    """
    forged_token = jwt.encode(
        {"sub": "auth-admin-uuid-0001", "role": "ADMIN"},
        "wrong_fake_secret_key_123",
        algorithm="HS256"
    )
    headers = {"Authorization": f"Bearer {forged_token}"}
    response = await client.get("/api/v1/admin/metrics", headers=headers)
    assert response.status_code == 401
