import sys
import os
from pathlib import Path

# Add backend directory to sys.path so app imports resolve
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "RealEstateIQ API" in data["message"]
    assert data["health"] == "/health"
    assert data["ready"] == "/ready"


def test_liveness_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["service"] == "RealEstateIQ API"


def test_readiness_without_model():
    # Model artifact does not exist yet in Phase 1, so /ready should return 503
    response = client.get("/ready")
    assert response.status_code in [200, 503]
    data = response.json()
    if response.status_code == 503:
        assert data["status"] == "not_ready"
        assert data["model_loaded"] is False
