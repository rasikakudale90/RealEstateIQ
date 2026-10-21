import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent
backend_path = repo_root / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
USER_TOKEN = "test-token-usr:11111111-1111-1111-1111-111111111111:user"
AUTH_HEADER = {"Authorization": f"Bearer {USER_TOKEN}"}


def test_sqft_minimum_boundary():
    # 100 sqft is below strictly required > 100
    res = client.post(
        "/api/v1/predictions",
        json={
            "location": "Urban",
            "total_sqft": 100,
            "bedrooms": 1,
            "bathrooms": 1.0,
            "year_built": 2020,
            "has_garage": False,
        },
        headers=AUTH_HEADER,
    )
    assert res.status_code == 422


def test_sqft_valid_boundary():
    res = client.post(
        "/api/v1/predictions",
        json={
            "location": "Urban",
            "total_sqft": 101,
            "bedrooms": 1,
            "bathrooms": 1.0,
            "year_built": 2020,
            "has_garage": False,
        },
        headers=AUTH_HEADER,
    )
    assert res.status_code == 201
    assert res.json()["predicted_price"] > 0


def test_year_built_boundaries():
    # Below min (1899)
    res_low = client.post(
        "/api/v1/predictions",
        json={
            "location": "Urban",
            "total_sqft": 1000,
            "bedrooms": 2,
            "bathrooms": 1.0,
            "year_built": 1899,
            "has_garage": False,
        },
        headers=AUTH_HEADER,
    )
    assert res_low.status_code == 422

    # Above max (2031)
    res_high = client.post(
        "/api/v1/predictions",
        json={
            "location": "Urban",
            "total_sqft": 1000,
            "bedrooms": 2,
            "bathrooms": 1.0,
            "year_built": 2031,
            "has_garage": False,
        },
        headers=AUTH_HEADER,
    )
    assert res_high.status_code == 422


def test_error_response_does_not_leak_traces():
    # Send malformed JSON body
    res = client.post(
        "/api/v1/predictions",
        content="This is not JSON",
        headers={"Content-Type": "application/json", **AUTH_HEADER},
    )
    assert res.status_code in (400, 422)
    # Ensure no internal python traceback is leaked in body
    body = res.text
    assert "Traceback (most recent call last)" not in body
    assert "File \"" not in body
