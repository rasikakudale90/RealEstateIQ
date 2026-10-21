from .health import router as health_router
from .predict import router as predict_router
from .profile import router as profile_router
from .admin import router as admin_router

__all__ = [
    "health_router",
    "predict_router",
    "profile_router",
    "admin_router",
]
