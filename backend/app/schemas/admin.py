from typing import List, Optional
from pydantic import BaseModel, Field
from .property import PredictionHistoryItem
from .user import UserProfile


class AdminSummaryResponse(BaseModel):
    """Aggregate statistics for admin dashboard."""
    total_users: int
    total_predictions: int
    average_predicted_price: float
    currency: str


class AdminUserListItem(UserProfile):
    """Admin view of a registered user including total predictions made."""
    prediction_count: int = 0


class AdminReportResponse(BaseModel):
    """Date-filtered prediction report for administrators."""
    start_date: str
    end_date: str
    total_count: int
    average_price: float
    currency: str
    predictions: List[PredictionHistoryItem]
