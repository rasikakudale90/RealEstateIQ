"""
Property prediction and user prediction history endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user
from app.db.repository import repository
from app.schemas.property import (
    PredictionHistoryItem,
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.schemas.user import UserProfile
from ml.inference.model.loader import ModelNotAvailableError
from ml.inference.model.predictor import PredictionError, predict_price

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post(
    "",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Estimate property price and save prediction record",
)
def create_prediction(
    request: PredictionRequest,
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Accepts validated property details, runs the trained ML pipeline,
    persists the prediction under the authenticated user's ID, and returns the estimate.
    """
    try:
        inference_result = predict_price(request.model_dump())
    except ModelNotAvailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction service unavailable: {e}",
        ) from e
    except PredictionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {e}",
        ) from e

    # Persist prediction snapshot linked strictly to the verified caller's ID
    saved_record = repository.save_prediction(
        user_id=current_user.id,
        input_data=request.model_dump(),
        predicted_price=inference_result["predicted_price"],
        currency=inference_result["currency"],
        model_version=inference_result["model_version"],
    )

    return PredictionResponse(
        prediction_id=saved_record.id,
        predicted_price=saved_record.predicted_price,
        currency=saved_record.currency,
        model_version=saved_record.model_version,
        created_at=saved_record.created_at,
        input_data=saved_record.input_data,
    )


@router.get(
    "",
    response_model=PredictionHistoryResponse,
    summary="List authenticated user's prediction history",
)
def list_user_predictions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Returns paginated prediction history for the authenticated user only.
    Strict data isolation is enforced; users cannot access other users' predictions.
    """
    total, items = repository.get_user_predictions(
        user_id=current_user.id, page=page, limit=limit
    )
    return PredictionHistoryResponse(
        total=total,
        page=page,
        limit=limit,
        items=items,
    )


@router.get(
    "/{prediction_id}",
    response_model=PredictionHistoryItem,
    summary="Retrieve a specific prediction record",
)
def get_prediction_detail(
    prediction_id: str,
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Retrieves a prediction record by ID.
    Enforces ownership check unless caller has administrator privileges.
    """
    is_admin = current_user.role == "admin"
    record = repository.get_prediction_by_id(
        prediction_id=prediction_id,
        requesting_user_id=current_user.id,
        is_admin=is_admin,
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found or access denied.",
        )
    return record
