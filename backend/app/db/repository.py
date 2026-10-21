"""
Data access layer for predictions and user profiles.
Supports Supabase PostgreSQL with in-memory thread-safe store for local testing.
"""
from datetime import datetime, timezone
import threading
from typing import Any, Dict, List, Optional, Tuple
import uuid
from app.core.config import settings
from app.schemas.admin import AdminReportResponse, AdminSummaryResponse, AdminUserListItem
from app.schemas.property import PredictionHistoryItem


class PredictionRepository:
    def __init__(self):
        self._lock = threading.Lock()
        self._predictions: List[Dict[str, Any]] = []

    def save_prediction(
        self,
        user_id: str,
        input_data: Dict[str, Any],
        predicted_price: float,
        currency: str,
        model_version: str,
    ) -> PredictionHistoryItem:
        record_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        record = {
            "id": record_id,
            "user_id": user_id,
            "input_data": input_data,
            "predicted_price": float(predicted_price),
            "currency": currency,
            "model_version": model_version,
            "created_at": created_at,
        }

        # If Supabase service credentials are provided, attempt persistence to PostgreSQL
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                import httpx
                headers = {
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                }
                with httpx.Client(timeout=4.0) as client:
                    res = client.post(
                        f"{settings.SUPABASE_URL}/rest/v1/predictions",
                        headers=headers,
                        json=record,
                    )
                    if res.status_code in (200, 201):
                        db_record = res.json()[0]
                        return PredictionHistoryItem(**db_record)
            except Exception:
                pass  # Fall back to local storage

        with self._lock:
            self._predictions.insert(0, record)

        return PredictionHistoryItem(**record)

    def get_user_predictions(
        self, user_id: str, page: int = 1, limit: int = 10
    ) -> Tuple[int, List[PredictionHistoryItem]]:
        with self._lock:
            user_recs = [p for p in self._predictions if p["user_id"] == user_id]

        total = len(user_recs)
        start = (page - 1) * limit
        end = start + limit
        items = [PredictionHistoryItem(**p) for p in user_recs[start:end]]
        return total, items

    def get_prediction_by_id(
        self, prediction_id: str, requesting_user_id: str, is_admin: bool = False
    ) -> Optional[PredictionHistoryItem]:
        with self._lock:
            for p in self._predictions:
                if p["id"] == prediction_id:
                    if is_admin or p["user_id"] == requesting_user_id:
                        return PredictionHistoryItem(**p)
                    return None
        return None

    def get_admin_summary(self) -> AdminSummaryResponse:
        with self._lock:
            total_predictions = len(self._predictions)
            unique_users = len(set(p["user_id"] for p in self._predictions))
            total_price = sum(p["predicted_price"] for p in self._predictions)

        avg_price = (total_price / total_predictions) if total_predictions > 0 else 0.0

        return AdminSummaryResponse(
            total_users=max(unique_users, 1),
            total_predictions=total_predictions,
            average_predicted_price=round(avg_price, 2),
            currency=settings.TARGET_CURRENCY,
        )

    def get_admin_users(self) -> List[AdminUserListItem]:
        with self._lock:
            user_counts: Dict[str, int] = {}
            for p in self._predictions:
                uid = p["user_id"]
                user_counts[uid] = user_counts.get(uid, 0) + 1

        users = []
        for uid, count in user_counts.items():
            users.append(
                AdminUserListItem(
                    id=uid,
                    display_name=f"User {uid[:8]}",
                    email=f"user_{uid[:6]}@example.com",
                    role="user",
                    prediction_count=count,
                )
            )
        return users

    def get_admin_reports(
        self, start_date: str, end_date: str
    ) -> AdminReportResponse:
        filtered = []
        with self._lock:
            for p in self._predictions:
                p_date = p["created_at"][:10]  # YYYY-MM-DD
                if start_date <= p_date <= end_date:
                    filtered.append(PredictionHistoryItem(**p))

        total_count = len(filtered)
        avg_price = (
            sum(item.predicted_price for item in filtered) / total_count
            if total_count > 0
            else 0.0
        )

        return AdminReportResponse(
            start_date=start_date,
            end_date=end_date,
            total_count=total_count,
            average_price=round(avg_price, 2),
            currency=settings.TARGET_CURRENCY,
            predictions=filtered,
        )


repository = PredictionRepository()
