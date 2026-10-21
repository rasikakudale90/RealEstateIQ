import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
repo_root = Path(__file__).resolve().parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

USER_A_TOKEN = "test-token-usrA:11111111-1111-1111-1111-111111111111:user"
USER_B_TOKEN = "test-token-usrB:22222222-2222-2222-2222-222222222222:user"
ADMIN_TOKEN = "test-token-admin:99999999-9999-9999-9999-999999999999:admin"


def test_readiness_now_returns_200():
    # Now that Phase 2 trained and exported the model, /ready must return 200 OK
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_loaded"] is True


def test_unauthenticated_request_rejected():
    payload = {
        "location": "Urban",
        "total_sqft": 1500,
        "bedrooms": 3,
        "bathrooms": 2,
        "year_built": 2018,
        "has_garage": True,
    }
    response = client.post("/api/v1/predictions", json=payload)
    assert response.status_code == 401
    assert "Missing or invalid authentication credentials" in response.json()["detail"]


def test_invalid_input_validation():
    # Square footage <= 100 should be rejected by Pydantic validation
    payload = {
        "location": "Urban",
        "total_sqft": -50,
        "bedrooms": 3,
        "bathrooms": 2,
        "year_built": 2018,
        "has_garage": True,
    }
    headers = {"Authorization": f"Bearer {USER_A_TOKEN}"}
    response = client.post("/api/v1/predictions", json=payload, headers=headers)
    assert response.status_code == 422


def test_authenticated_prediction_creation():
    payload = {
        "location": "Urban",
        "total_sqft": 1850,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "year_built": 2020,
        "has_garage": True,
    }
    headers = {"Authorization": f"Bearer {USER_A_TOKEN}"}
    response = client.post("/api/v1/predictions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "prediction_id" in data
    assert data["predicted_price"] > 0
    assert data["currency"] == "INR"
    assert data["input_data"]["total_sqft"] == 1850


def test_user_history_isolation():
    # User A creates a prediction
    payload = {
        "location": "Suburban",
        "total_sqft": 2100,
        "bedrooms": 4,
        "bathrooms": 3,
        "year_built": 2015,
        "has_garage": True,
    }
    headers_a = {"Authorization": f"Bearer {USER_A_TOKEN}"}
    res_a = client.post("/api/v1/predictions", json=payload, headers=headers_a)
    assert res_a.status_code == 201
    pred_a_id = res_a.json()["prediction_id"]

    # User B checks their own history
    headers_b = {"Authorization": f"Bearer {USER_B_TOKEN}"}
    res_b_list = client.get("/api/v1/predictions", headers=headers_b)
    assert res_b_list.status_code == 200
    b_items = res_b_list.json()["items"]
    # User A's prediction must NOT appear in User B's history
    assert not any(item["id"] == pred_a_id for item in b_items)

    # User B attempts to access User A's prediction by ID directly -> 404
    res_b_detail = client.get(f"/api/v1/predictions/{pred_a_id}", headers=headers_b)
    assert res_b_detail.status_code == 404


def test_admin_authorization():
    headers_user = {"Authorization": f"Bearer {USER_A_TOKEN}"}
    headers_admin = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

    # Regular user attempting admin endpoint -> 403 Forbidden
    res_forbidden = client.get("/api/v1/admin/summary", headers=headers_user)
    assert res_forbidden.status_code == 403

    # Admin accessing summary -> 200 OK
    res_admin = client.get("/api/v1/admin/summary", headers=headers_admin)
    assert res_admin.status_code == 200
    summary = res_admin.json()
    assert "total_predictions" in summary
    assert summary["total_predictions"] >= 1

    # Admin date-filtered reports
    res_report = client.get(
        "/api/v1/admin/reports?start_date=2026-01-01&end_date=2026-12-31",
        headers=headers_admin,
    )
    assert res_report.status_code == 200
    report = res_report.json()
    assert report["total_count"] >= 1
    assert "average_price" in report
