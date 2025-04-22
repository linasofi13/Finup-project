from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .user_category import UserCategory


class UserBase(BaseModel):
    username: str
    email: str
    rol: str = "consultor"


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)


class User(UserBase):
    id: int
    categories: List["UserCategory"] = None

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[str] = None  # <--- NUEVO CAMPO

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    username: str
    email: str
    rol: str  # <--- NUEVO CAMPO

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
