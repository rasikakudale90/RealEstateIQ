import os
from datetime import datetime, timezone
from fastapi import APIRouter, Response, status
from app.core.config import settings

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/health", status_code=status.HTTP_200_OK)
def liveness_check():
    """
    Minimal liveness check to verify the API service process is alive.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready")
def readiness_check(response: Response):
    """
    Readiness probe verifying if required resources and model artifacts are available.
    Returns 200 OK when ready, or 503 Service Unavailable when model is missing.
    """
    model_path = settings.MODEL_ARTIFACT_PATH
    model_loaded = os.path.exists(model_path) and os.path.getsize(model_path) > 0

    if not model_loaded:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "message": "Model artifact is not available.",
            "model_loaded": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return {
        "status": "ready",
        "model_loaded": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
