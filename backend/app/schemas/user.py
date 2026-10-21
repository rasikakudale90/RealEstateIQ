from typing import Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """Authenticated user profile representation."""
    id: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    role: str = "user"
    created_at: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    """Permitted fields for user profile update."""
    display_name: str = Field(..., min_length=2, max_length=100, description="Updated display name")
