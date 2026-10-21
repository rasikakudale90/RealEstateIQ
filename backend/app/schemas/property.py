from typing import Any, Dict
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Property characteristics input schema for price prediction."""
    location: str = Field(..., description="Location category (Urban, Suburban, Rural, or city)", examples=["Urban"])
    total_sqft: float = Field(..., gt=100, le=30000, description="Total property area in square feet", examples=[1800])
    bedrooms: int = Field(..., ge=1, le=15, description="Number of bedrooms", examples=[3])
    bathrooms: float = Field(..., ge=1.0, le=12.0, description="Number of bathrooms", examples=[2.0])
    year_built: int = Field(..., ge=1900, le=2030, description="Construction year", examples=[2015])
    has_garage: bool = Field(default=False, description="Whether property has garage parking", examples=[True])


class PredictionResponse(BaseModel):
    """Price prediction response schema."""
    prediction_id: str = Field(..., description="Unique prediction identifier")
    predicted_price: float = Field(..., description="Estimated property market price")
    currency: str = Field(..., description="Configured target currency code (e.g., INR)")
    model_version: str = Field(..., description="Trained model artifact version")
    created_at: str = Field(..., description="Prediction generation timestamp in ISO format")
    input_data: Dict[str, Any] = Field(..., description="Snapshot of property characteristics evaluated")


class PredictionHistoryItem(BaseModel):
    """Historical prediction record."""
    id: str
    user_id: str
    input_data: Dict[str, Any]
    predicted_price: float
    currency: str
    model_version: str
    created_at: str


class PredictionHistoryResponse(BaseModel):
    """Paginated prediction history list."""
    total: int
    page: int
    limit: int
    items: list[PredictionHistoryItem]
