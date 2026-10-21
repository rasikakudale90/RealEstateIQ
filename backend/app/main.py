from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import admin_router, health_router, predict_router, profile_router
from app.core.config import settings
from ml.inference.model.loader import get_pipeline

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("realestateiq.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting %s (version: %s, env: %s)",
        settings.PROJECT_NAME,
        settings.VERSION,
        settings.ENVIRONMENT,
    )
    # Warm up / preload ML pipeline at startup as required by SRS
    try:
        get_pipeline()
        logger.info("Successfully loaded ML inference pipeline at startup.")
    except Exception as e:
        logger.warning("ML pipeline preload deferred or not found: %s", e)

    yield
    logger.info("Shutting down %s", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RealEstateIQ Machine Learning Property Price Prediction Service",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware (100% environment-driven)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root and Health check endpoints
app.include_router(health_router)

# Versioned API routes (/api/v1)
api_prefix = settings.API_V1_PREFIX
app.include_router(predict_router, prefix=api_prefix)
app.include_router(profile_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
        "api_v1": {
            "predict": f"{api_prefix}/predictions",
            "history": f"{api_prefix}/predictions",
            "profile": f"{api_prefix}/profile",
            "admin_summary": f"{api_prefix}/admin/summary",
            "admin_reports": f"{api_prefix}/admin/reports",
        },
    }
