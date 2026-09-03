import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_crops_and_diseases(client: AsyncClient):
    """Test retrieving list of crops with integrated diseases."""
    response = await client.get("/api/v1/crops")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) >= 4
    tomato = next((c for c in crops if c["name"] == "Tomato"), None)
    assert tomato is not None
    assert len(tomato["diseases"]) >= 1


@pytest.mark.asyncio
async def test_recommendation_lookup_matrix(client: AsyncClient):
    """Test querying disease advisory matrix for Tomato Early Blight."""
    response = await client.get("/api/v1/recommendations/lookup?crop=Tomato&disease=Early%20Blight")
    assert response.status_code == 200
    rec = response.json()
    assert rec is not None
    assert rec["crop_name"] == "Tomato"
    assert rec["disease_name"] == "Early Blight"
    assert len(rec["recommended_products"]) >= 2
    # Verify priority 1 product
    p1 = rec["recommended_products"][0]
    assert p1["priority"] == 1
    assert p1["role"] == "Primary Curative Treatment"


@pytest.mark.asyncio
async def test_farmer_scan_history_workflow(client: AsyncClient, farmer_auth_headers: dict):
    """Test logging an on-device AI scan finding and retrieving history."""
    scan_payload = {
        "crop_name": "Tomato",
        "disease_detected": "Early Blight",
        "confidence_score": 96.8,
        "image_url": "https://example.com/leaf_scan.jpg",
        "plot_name": "South Sector Greenhouse 2",
    }
    create_resp = await client.post("/api/v1/farmer/scans", json=scan_payload, headers=farmer_auth_headers)
    assert create_resp.status_code == 201
    scan = create_resp.json()
    assert scan["scan_code"].startswith("SCN-")

    # List scan history
    list_resp = await client.get("/api/v1/farmer/scans", headers=farmer_auth_headers)
    assert list_resp.status_code == 200
    scans = list_resp.json()
    assert any(s["scan_code"] == scan["scan_code"] for s in scans)
