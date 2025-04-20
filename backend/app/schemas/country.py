from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .role_provider import RoleProvider


class CountryBase(BaseModel):
    name: str


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    id: int
    # Relationships from Country
    role_providers: List["RoleProvider"] = Field(
        default_factory=list
    )  # Assuming RoleProvider is defined elsewhere

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class CountryUpdate(CountryBase):
    name: Optional[str] = None

    class Config:
        from_attributes = True


class CountryResponse(CountryBase):
    id: int
    name: str

    class Config:
        from_attributes = True
