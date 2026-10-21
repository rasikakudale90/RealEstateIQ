"""
Training and evaluation script for RealEstateIQ regression pipeline.
Adheres strictly to SRS Section 4 (Machine-Learning Requirements).
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("realestateiq.ml.train")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = ROOT_DIR / "training" / "data" / "processed" / "housing_data.csv"
ARTIFACTS_DIR = ROOT_DIR / "inference" / "artifacts"

CATEGORICAL_FEATURES = ["location"]
NUMERICAL_FEATURES = ["total_sqft", "bedrooms", "bathrooms", "year_built", "has_garage"]
TARGET_COLUMN = "price"
FEATURE_ORDER = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


def create_preprocessor() -> ColumnTransformer:
    """
    Constructs scikit-learn ColumnTransformer for preprocessing.
    Categorical: OneHotEncoder with handle_unknown='ignore'
    Numerical: Median Imputer + StandardScaler
    """
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )


def train_and_evaluate_candidates(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> tuple[dict, str, Pipeline]:
    """
    Trains candidate regressors (Linear Regression, Decision Tree, Random Forest)
    and reports MAE, RMSE, and R2 on held-out test data.
    """
    candidates = {
        "Linear Regression (Baseline)": LinearRegression(),
        "Decision Tree Regressor": DecisionTreeRegressor(max_depth=10, random_state=42),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=100, max_depth=14, random_state=42, n_jobs=-1
        ),
    }

    results = {}
    best_r2 = -float("inf")
    best_name = ""
    best_pipeline = None

    logger.info("Evaluating candidate models on held-out test data...")

    for name, estimator in candidates.items():
        preprocessor = create_preprocessor()
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", estimator)])

        # Fit strictly on training data
        pipeline.fit(X_train, y_train)

        # Predict on held-out test set
        y_pred = pipeline.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        results[name] = {
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "R2": round(r2, 4),
        }

        logger.info("Candidate [%s] -> MAE: %s, RMSE: %s, R2: %s", name, round(mae, 2), round(rmse, 2), round(r2, 4))

        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipeline

    logger.info("Selected best model: %s (R2: %s)", best_name, round(best_r2, 4))
    return results, best_name, best_pipeline


def run_training_pipeline():
    logger.info("Loading dataset from %s", DATA_PATH)
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Processed dataset not found at {DATA_PATH}. Run generate_data.py first.")

    df = pd.read_csv(DATA_PATH)
    logger.info("Dataset shape: %s rows, %s columns", len(df), len(df.columns))

    X = df[FEATURE_ORDER]
    y = df[TARGET_COLUMN]

    # Split into 80% train and 20% held-out test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    logger.info("Training set: %s samples, Test set: %s samples", len(X_train), len(X_test))

    results, best_name, winning_pipeline = train_and_evaluate_candidates(
        X_train, X_test, y_train, y_test
    )

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    pipeline_path = ARTIFACTS_DIR / "house_price_pipeline.joblib"
    metadata_path = ARTIFACTS_DIR / "model_metadata.json"

    # Export serialized pipeline
    joblib.dump(winning_pipeline, pipeline_path, compress=3)
    logger.info("Exported serialized pipeline to %s", pipeline_path)

    # Save model metadata
    metadata = {
        "model_version": "1.0.0",
        "algorithm": best_name,
        "features": {
            "categorical": CATEGORICAL_FEATURES,
            "numerical": NUMERICAL_FEATURES,
            "order": FEATURE_ORDER,
        },
        "target": {
            "name": TARGET_COLUMN,
            "currency": "INR",
            "unit": "Rupees",
        },
        "metrics": results[best_name],
        "candidate_comparisons": results,
        "dataset": {
            "source": "housing_data.csv",
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Exported model metadata to %s", metadata_path)

    # Validation: Test reload equivalence
    reloaded_pipeline = joblib.load(pipeline_path)
    sample_input = X_test.iloc[:5]
    orig_preds = winning_pipeline.predict(sample_input)
    reloaded_preds = reloaded_pipeline.predict(sample_input)
    np.testing.assert_allclose(orig_preds, reloaded_preds, rtol=1e-5)
    logger.info("Reload equivalence check passed! Predictions match identically.")


if __name__ == "__main__":
    run_training_pipeline()
