from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
from app.schemas.category_provider import CategoryProviderResponse
from app.schemas.category_line import CategoryLineResponse
from app.schemas.role_provider import RoleProviderResponse

if TYPE_CHECKING:
    from .role_provider import RoleProviderResponse
    from .category_provider import CategoryProviderResponse
    from .category_line import CategoryLineResponse


class ProviderBase(BaseModel):
    name: str
    email: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    cost_usd: Optional[float] = None
    category_provider_id: int
    category_line_id: Optional[int] = None


class ProviderCreate(ProviderBase):
    pass


class Provider(ProviderBase):
    id: int
    role_providers: List["RoleProviderResponse"] = Field(default_factory=list)
    category_provider: Optional["CategoryProviderResponse"] = None
    category_line: Optional["CategoryLineResponse"] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())

    class Config:
        from_attributes = True


class ProviderResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    cost_usd: Optional[float] = None
    country: Optional[str] = None  # 👈 nombre del país como string
    category: Optional[str] = None  # 👈 nombre del category_role como string
    category_provider: Optional[str] = None  # 👈 nombre de la categoría como string
    line: Optional[str] = None  # 👈 nombre de la línea como string

    class Config:
        orm_mode = True



    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_extras(cls, provider):
        role_provider = provider.role_providers[0] if provider.role_providers else None
        role = role_provider.role if role_provider and role_provider.role else None
        country = role_provider.country if role_provider and role_provider.country else None

        return cls(
            id=provider.id,
            name=provider.name,
            email=provider.email,
            company=provider.company,
            role=role.name if role else None,
            cost_usd=role_provider.price_usd if role_provider else None,
            country=country.name if country else None,
            category=role.category_role.name if role and role.category_role else None,
            category_provider=provider.category_provider.name if provider.category_provider else None,  # 👈 Asegúrate de acceder a `.name`
            line=provider.category_line.name if provider.category_line else None,
            role_providers=[]  # O puedes mapear si necesitas
        )





class ProviderUpdate(ProviderBase):
    name: Optional[str] = None
    category_provider_id: Optional[int] = None
    category_line_id: Optional[int] = None

    class Config:
        from_attributes = True
