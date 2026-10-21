"""
Admin dashboard, user directory, and date-filtered report endpoints.
Strictly restricted to users with administrator role verified server-side.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_admin
from app.db.repository import repository
from app.schemas.admin import (
    AdminReportResponse,
    AdminSummaryResponse,
    AdminUserListItem,
)
from app.schemas.property import PredictionHistoryItem
from app.schemas.user import UserProfile

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get(
    "/summary",
    response_model=AdminSummaryResponse,
    summary="Dashboard aggregate statistics",
)
def get_admin_summary(admin_user: UserProfile = Depends(get_current_admin)):
    """Returns total users, prediction counts, and average predicted prices."""
    return repository.get_admin_summary()


@router.get(
    "/users",
    response_model=List[AdminUserListItem],
    summary="List registered users and prediction counts",
)
def list_admin_users(admin_user: UserProfile = Depends(get_current_admin)):
    """Lists registered users and their prediction volumes."""
    return repository.get_admin_users()


@router.get(
    "/predictions",
    response_model=List[PredictionHistoryItem],
    summary="List/search all predictions across users",
)
def list_all_predictions(
    limit: int = Query(50, ge=1, le=100),
    admin_user: UserProfile = Depends(get_current_admin),
):
    """Allows administrators to inspect recent predictions across all users."""
    summary = repository.get_admin_reports("1900-01-01", "2099-12-31")
    return summary.predictions[:limit]


@router.get(
    "/reports",
    response_model=AdminReportResponse,
    summary="Generate date-filtered prediction report",
)
def generate_admin_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    admin_user: UserProfile = Depends(get_current_admin),
):
    """
    Filters predictions within the inclusive date range [start_date, end_date]
    and computes aggregate metrics (count, average price).
    """
    return repository.get_admin_reports(start_date=start_date, end_date=end_date)
