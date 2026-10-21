"""
Predictor service executing ML inference using the loaded scikit-learn pipeline.
Reuses existing fitted transformations without refitting.
"""
from typing import Any, Dict
import pandas as pd
from app.core.config import settings
from ml.inference.model.loader import get_pipeline

FEATURE_ORDER = ["location", "total_sqft", "bedrooms", "bathrooms", "year_built", "has_garage"]


class PredictionError(Exception):
    """Raised when an error occurs during model evaluation."""
    pass


def predict_price(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes inference on property data and returns prediction details.
    """
    pipeline = get_pipeline()

    # Construct single-row DataFrame matching the training feature contract
    row = {
        "location": str(property_data.get("location", "Urban")),
        "total_sqft": float(property_data["total_sqft"]),
        "bedrooms": int(property_data["bedrooms"]),
        "bathrooms": float(property_data["bathrooms"]),
        "year_built": int(property_data["year_built"]),
        "has_garage": bool(property_data.get("has_garage", False)),
    }

    df = pd.DataFrame([row])[FEATURE_ORDER]

    try:
        raw_pred = pipeline.predict(df)[0]
    except Exception as e:
        raise PredictionError(f"Inference execution failed: {e}") from e

    # Ensure finite, non-negative estimate
    predicted_price = float(raw_pred)
    if predicted_price != predicted_price or predicted_price < 0:  # NaN or negative check
        raise PredictionError("Inference generated invalid or non-finite price estimate.")

    # Round to nearest thousand for realistic presentation
    formatted_price = round(predicted_price, -3)

    return {
        "predicted_price": formatted_price,
        "currency": settings.TARGET_CURRENCY,
        "model_version": settings.VERSION,
    }
