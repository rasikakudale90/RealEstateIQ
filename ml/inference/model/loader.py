"""
Thread-safe cached model loader for RealEstateIQ production inference.
Loads the serialized scikit-learn pipeline once at application startup.
"""
from pathlib import Path
import threading
import joblib
from sklearn.pipeline import Pipeline
from app.core.config import settings

_model_lock = threading.Lock()
_loaded_pipeline: Pipeline | None = None


class ModelNotAvailableError(Exception):
    """Raised when the serialized model artifact cannot be located or loaded."""
    pass


def get_pipeline() -> Pipeline:
    """
    Returns the cached singleton pipeline instance.
    Loads it thread-safely on the first invocation.
    """
    global _loaded_pipeline

    if _loaded_pipeline is not None:
        return _loaded_pipeline

    with _model_lock:
        if _loaded_pipeline is not None:
            return _loaded_pipeline

        artifact_path = Path(settings.MODEL_ARTIFACT_PATH)
        if not artifact_path.is_absolute():
            # Resolve relative to repo root
            repo_root = Path(__file__).resolve().parent.parent.parent.parent
            artifact_path = repo_root / artifact_path

        if not artifact_path.exists() or artifact_path.stat().st_size == 0:
            raise ModelNotAvailableError(
                f"Model artifact not found at {artifact_path}. Offline training must be completed first."
            )

        try:
            pipeline = joblib.load(artifact_path)
            _loaded_pipeline = pipeline
            return _loaded_pipeline
        except Exception as e:
            raise ModelNotAvailableError(
                f"Failed to deserialize model pipeline from {artifact_path}: {e}"
            ) from e


def is_model_loaded() -> bool:
    """Returns True if the model is loaded or accessible on disk."""
    try:
        pipeline = get_pipeline()
        return pipeline is not None
    except ModelNotAvailableError:
        return False
