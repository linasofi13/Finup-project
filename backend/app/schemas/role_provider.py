from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .role import Role, RoleResponse
    from .country import Country, CountryResponse
    from .provider import Provider, ProviderResponse
    from .evc_financial import EVC_Financial


class RoleProviderBase(BaseModel):
    role_id: int
    provider_id: int
    country_id: int

    price_usd: float


class RoleProviderCreate(RoleProviderBase):
    pass


class RoleProvider(RoleProviderBase):
    id: int

    # Relationships to RoleProvider
    role: Optional["Role"] = None  # Assuming Role is defined elsewhere
    country: Optional["Country"] = None  # Assuming Country is defined elsewhere
    provider: Optional["Provider"] = None  # Assuming Provider is defined elsewhere

    # Relationships from RoleProvider
    evc_financials: List["EVC_Financial"] = Field(
        default_factory=list
    )  # Assuming EVC_Financial is defined elsewhere

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class RoleProviderResponse(RoleProviderBase):
    id: int
    role_id: int
    provider_id: int
    country_id: int

    price_usd: float

    # Relationships to RoleProvider
    role: Optional["RoleResponse"] = None  # Assuming Role is defined elsewhere
    country: Optional["CountryResponse"] = None  # Assuming Country is defined elsewhere
    provider: Optional[
        "ProviderResponse"
    ] = None  # Assuming Provider is defined elsewhere


class RoleProviderUpdate(RoleProviderBase):
    role_id: Optional[int] = None
    provider_id: Optional[int] = None
    country_id: Optional[int] = None
    price_usd: Optional[float] = None

    class Config:
        from_attributes = True


# from .role import Role
# from .country import Country
# from .provider import Provider
# from .evc_financial import EVC_Financial
# RoleProvider.model_rebuild()
