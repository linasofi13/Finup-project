from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
if TYPE_CHECKING:
    from .user_category import UserCategory

class CategoryBase(BaseModel):
    name: str
class CategoryCreate(CategoryBase):
    pass
class Category(CategoryBase):
    id: int
    users: List["UserCategory"] = None  # Renamed for consistency

    class Config:
        from_attributes = True


