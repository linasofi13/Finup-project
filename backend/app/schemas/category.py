from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
if TYPE_CHECKING:
    from .app_user_category import AppUserCategory

class CategoryBase(BaseModel):
    name: str
class CategoryCreate(CategoryBase):
    pass
class Category(CategoryBase):
  id: int
  last_updated: datetime = Field(default_factory=datetime.utcnow)
  #Relationships from Category
  app_user_categories: List["AppUserCategory"] = Field(default_factory=list)  # Assuming AppUserCategory is defined elsewhere
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

