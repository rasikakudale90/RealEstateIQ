"""
User profile management routes.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.user import ProfileUpdateRequest, UserProfile

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("", response_model=UserProfile, summary="Get own user profile")
def get_profile(current_user: UserProfile = Depends(get_current_user)):
    """Returns the authenticated user's profile details."""
    return current_user


@router.patch("", response_model=UserProfile, summary="Update permitted profile fields")
def update_profile(
    update_data: ProfileUpdateRequest,
    current_user: UserProfile = Depends(get_current_user),
):
    """Updates permitted profile fields (e.g. display name)."""
    current_user.display_name = update_data.display_name
    return current_user
