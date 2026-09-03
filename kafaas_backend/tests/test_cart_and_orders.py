import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_authoritative_cart_calculation(client: AsyncClient):
    """Test authoritative cart calculations with volume discount, subsidy, and GST."""
    payload = {
        "items": [
            {"product_id": "prod-1", "quantity": 2},  # 2 x 1450 = 2900 (qualifies for 5% bulk discount & ₹100 subsidy)
        ],
        "kisan_subsidy_applied": True,
    }
    response = await client.post("/api/v1/cart/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["subtotal"] == 2900.0
    assert data["discount"] == 145.0  # 5% of 2900
    assert data["farmer_subsidy_discount"] == 100.0  # ₹100 direct subsidy
    assert data["delivery_charge"] == 0.0  # > ₹999 free delivery
    assert data["all_items_in_stock"] == True


@pytest.mark.asyncio
async def test_create_order_authenticated(client: AsyncClient, farmer_auth_headers: dict):
    """Test order creation by authenticated farmer."""
    payload = {
        "items": [
            {"product_id": "prod-3", "quantity": 2},  # 2 x 280 = 560
        ],
        "payment_method": "upi",
        "notes": "Please deliver before evening",
    }
    response = await client.post("/api/v1/orders", json=payload, headers=farmer_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["order_number"].startswith("KFS-")
    assert len(data["items"]) == 1
    assert len(data["timeline"]) >= 4
    assert data["status"] == "confirmed"


@pytest.mark.asyncio
async def test_create_order_unauthenticated_rejected(client: AsyncClient):
    """Test unauthenticated order placement is gated and returns 401."""
    payload = {
        "items": [{"product_id": "prod-1", "quantity": 1}],
        "payment_method": "cod",
    }
    response = await client.post("/api/v1/orders", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_cancel_order_workflow(client: AsyncClient, farmer_auth_headers: dict):
    """Test farmer cancellation of pending/confirmed order."""
    # Place an order first
    create_resp = await client.post(
        "/api/v1/orders",
        json={"items": [{"product_id": "prod-4", "quantity": 1}], "payment_method": "cod"},
        headers=farmer_auth_headers,
    )
    order = create_resp.json()
    order_id = order["id"]

    # Cancel order
    cancel_resp = await client.post(
        f"/api/v1/orders/{order_id}/cancel",
        json={"reason": "Rainfall forecast rescheduled spray plan"},
        headers=farmer_auth_headers,
    )
    assert cancel_resp.status_code == 200
    cancelled_data = cancel_resp.json()
    assert cancelled_data["status"] == "cancelled"
    assert cancelled_data["cancellation_allowed"] == False
