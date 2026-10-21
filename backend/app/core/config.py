from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings strictly managed via environment variables.
    Defaults are provided for local development; override via system environment or .env.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    PROJECT_NAME: str = "RealEstateIQ API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Comma-separated allowed frontend origins for CORS
    FRONTEND_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Supabase credentials (environment driven)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Model and artifacts
    MODEL_ARTIFACT_PATH: str = "ml/inference/artifacts/house_price_pipeline.joblib"
    MODEL_METADATA_PATH: str = "ml/inference/artifacts/model_metadata.json"
    TARGET_CURRENCY: str = "INR"

    @property
    def cors_origins(self) -> List[str]:
        if not self.FRONTEND_ORIGINS:
            return ["http://localhost:3000"]
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]


settings = Settings()
