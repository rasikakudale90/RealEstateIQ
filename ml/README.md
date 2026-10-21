# Machine Learning Module (RealEstateIQ)

This directory contains the machine learning assets, training workflows, and production inference loaders.

## Structure
* **`training/`**: Offline scripts, data exploration, candidate model training, and metrics generation.
* **`inference/`**: Production inference code, thread-safe model loader, and serialized pipeline artifacts.
  * **`artifacts/`**: Stores `house_price_pipeline.joblib` and `model_metadata.json`.

## Supported Model Features
1. `location`: Categorical locality or region (e.g., Urban, Suburban, Rural).
2. `total_sqft`: Continuous positive numeric area in square feet.
3. `bedrooms`: Discrete count of bedrooms.
4. `bathrooms`: Discrete or half-count of bathrooms.
5. `year_built`: Construction year.
6. `has_garage`: Boolean indicator of garage availability.

## ML Architecture Rules
* Preprocessing steps (imputers, scalers, one-hot encoders) are fit strictly on training splits and bundled within the pipeline.
* Production inference reuses the fitted pipeline transformations without refitting.
* Evaluates Linear Regression (baseline), Decision Tree Regressor, and Random Forest Regressor using MAE, RMSE, and R².
