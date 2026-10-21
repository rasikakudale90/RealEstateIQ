import json
import sys
from pathlib import Path
import numpy as np
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
backend_path = REPO_ROOT / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from ml.inference.model.loader import get_pipeline, is_model_loaded
from ml.inference.model.predictor import predict_price, FEATURE_ORDER
from sklearn.pipeline import Pipeline


def test_model_artifact_is_available():
    assert is_model_loaded() is True
    pipeline = get_pipeline()
    assert isinstance(pipeline, Pipeline)
    assert "preprocessor" in pipeline.named_steps
    assert "regressor" in pipeline.named_steps


def test_prediction_output():
    sample_input = {
        "location": "Urban",
        "total_sqft": 1500,
        "bedrooms": 3,
        "bathrooms": 2,
        "year_built": 2018,
        "has_garage": True,
    }
    result = predict_price(sample_input)
    assert "predicted_price" in result
    assert isinstance(result["predicted_price"], float)
    assert result["predicted_price"] > 0
    assert result["currency"] == "INR"
    assert "model_version" in result


def test_unseen_category_handling():
    # Model should gracefully handle unseen categorical inputs (via handle_unknown='ignore')
    sample_input = {
        "location": "CoastalHighlands",
        "total_sqft": 1200,
        "bedrooms": 2,
        "bathrooms": 1,
        "year_built": 2005,
        "has_garage": False,
    }
    result = predict_price(sample_input)
    assert result["predicted_price"] > 0


def test_metadata_file_completeness():
    metadata_path = REPO_ROOT / "ml" / "inference" / "artifacts" / "model_metadata.json"
    assert metadata_path.exists()

    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert "algorithm" in meta
    assert "metrics" in meta
    assert "MAE" in meta["metrics"]
    assert "RMSE" in meta["metrics"]
    assert "R2" in meta["metrics"]
    assert meta["metrics"]["R2"] > 0.85
    assert "candidate_comparisons" in meta
    assert len(meta["candidate_comparisons"]) >= 3


def test_reload_equivalence():
    import joblib

    artifact_path = REPO_ROOT / "ml" / "inference" / "artifacts" / "house_price_pipeline.joblib"
    fresh_pipeline = joblib.load(artifact_path)
    cached_pipeline = get_pipeline()

    sample_input = {
        "location": "Suburban",
        "total_sqft": 2200,
        "bedrooms": 4,
        "bathrooms": 3,
        "year_built": 2012,
        "has_garage": True,
    }

    import pandas as pd
    df = pd.DataFrame([sample_input])[FEATURE_ORDER]

    pred1 = fresh_pipeline.predict(df)[0]
    pred2 = cached_pipeline.predict(df)[0]
    assert np.isclose(pred1, pred2)
