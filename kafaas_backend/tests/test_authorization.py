import pytest
from httpx import AsyncClient
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_farmer_denied_admin_endpoint(client: AsyncClient, farmer_auth_headers: dict):
    """Test that a user with FARMER role receives 403 when calling an admin endpoint."""
    response = await client.get("/api/v1/admin/metrics", headers=farmer_auth_headers)
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_farmer_denied_product_creation(client: AsyncClient, farmer_auth_headers: dict):
    """Test that a FARMER cannot create a global store product."""
    payload = {
        "name": "Unauthorized Agro Product",
        "brand": "Illegal Brand",
        "category_name": "Fungicides",
        "sku": "UNAUTH-SKU-001",
        "description": "Unauthorized attempt",
        "price": 500.0,
        "main_image": "https://example.com/img.jpg",
        "pack_size": "500ml",
        "form": "Liquid",
    }
    response = await client.post("/api/v1/products", json=payload, headers=farmer_auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_vendor_denied_admin_endpoint(client: AsyncClient, vendor_auth_headers: dict):
    """Test that a VENDOR cannot access admin user management."""
    response = await client.get("/api/v1/admin/users", headers=vendor_auth_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_allowed_admin_endpoint(client: AsyncClient, admin_auth_headers: dict):
    """Test that an ADMIN successfully accesses admin metrics."""
    response = await client.get("/api/v1/admin/metrics", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_farmers" in data


@pytest.mark.asyncio
async def test_object_level_isolation_between_farmers(client: AsyncClient):
    """
    Test object-level authorization: Farmer B cannot access Farmer A's order.
    """
    # Create Farmer B
    farmer_b_token = create_access_token(
        data={
            "sub": "auth-farmer-b-uuid",
            "email": "farmer.b@kafaas.com",
            "role": "FARMER",
        }
    )
    farmer_b_headers = {"Authorization": f"Bearer {farmer_b_token}"}

    # Attempt to access Farmer A's seeded order 'ord-sample-001'
    response = await client.get("/api/v1/orders/ord-sample-001", headers=farmer_b_headers)
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_vendor_access_own_inventory(client: AsyncClient, vendor_auth_headers: dict):
    """Test that a vendor can access their assigned warehouse inventory."""
    response = await client.get("/api/v1/inventory/vendor", headers=vendor_auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
