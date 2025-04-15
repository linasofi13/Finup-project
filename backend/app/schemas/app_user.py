from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .app_user_category import AppUserCategory

class AppUserBase(BaseModel):
    username: str
class AppUserCreate(AppUserBase):
    pass
class AppUser(AppUserBase):
  id: int
  #Relationships from AppUser
  app_user_categories: List["AppUserCategory"] = Field(default_factory=list)  
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
