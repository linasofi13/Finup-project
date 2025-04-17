from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
from app.schemas.role_provider import RoleProvider
from app.schemas.category_provider import CategoryProvider

if TYPE_CHECKING:
    from .category_provider import CategoryProvider, CategoryProviderResponse
    from .role_provider import RoleProvider


class ProviderBase(BaseModel):
    name: str
    category_provider_id: int


class ProviderCreate(ProviderBase):
    pass  # validate provider creation

class Provider(ProviderBase):
    id: int
    # Relationships from Provider
    role_providers: List["RoleProvider"] = Field(default_factory=list)  # Assuming RoleProvider is defined elsewhere
    # Relationships to Provider
    category_provider: Optional["CategoryProvider"] = None  # Assuming CategoryProvider is defined elsewhere
    created_at: datetime = Field(default_factory=lambda: datetime.now(datetime.timezone.utc))
    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class ProviderResponse(ProviderBase):
    id: int
    name: str
    category_provider_id: int
    category_provider: Optional["CategoryProviderResponse"] = None
    
class ProviderUpdate(ProviderBase):
    name: Optional[str] = None
    category_provider_id: Optional[int] = None
    class Config:
        from_attributes = True  


