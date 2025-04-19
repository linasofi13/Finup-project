from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .user_category import UserCategory

class UserBase(BaseModel):
    username: str
    email: str
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)
    # is_admin: bool = False
    # is_active: bool = True
class User(UserBase):
  id: int
  #Relationships from AppUser
  categories: List["UserCategory"] = None
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    # is_admin: Optional[bool] = None
    # is_active: Optional[bool] = None

    class Config:
        from_attributes = True
        
class UserResponse(UserBase):
    id: int
    username: str
    email: str
    # is_admin: bool
    # is_active: bool
    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None