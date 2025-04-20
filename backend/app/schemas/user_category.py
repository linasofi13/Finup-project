from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .category import Category
    from .user import User


class UserCategoryBase(BaseModel):
    user_id: int
    category_id: int


class UserCategoryCreate(UserCategoryBase):
    pass


class UserCategory(UserCategoryBase):
    id: int
    # Relationships to AppUserCategory
    category: Optional["Category"] = None  # Assuming Category is defined elsewhere
    user: Optional["User"] = None  # Assuming AppUser is defined elsewhere

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
