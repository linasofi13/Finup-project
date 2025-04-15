from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .role import Role
    from .country import Country
    from .provider import Provider
    from .evc_financial import EVC_Financial

class RoleProviderBase(BaseModel):
    role_id: int
    provider_id: int
    country_id: int
    
    price_usd: float
    
    last_updated: datetime = Field(default_factory=datetime.utcnow)
class RoleProviderCreate(RoleProviderBase):
    pass
class RoleProvider(RoleProviderBase):
    id: int
    
    # Relationships to RoleProvider
    role: Optional["Role"] = None  # Assuming Role is defined elsewhere
    country: Optional["Country"] = None  # Assuming Country is defined elsewhere
    provider: Optional["Provider"] = None  # Assuming Provider is defined elsewhere
    
    # Relationships from RoleProvider
    evc_financials: List["EVC_Financial"] = Field(default_factory=list)  # Assuming EVC_Financial is defined elsewhere
    
    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2



# from .role import Role
# from .country import Country
# from .provider import Provider
# from .evc_financial import EVC_Financial
# RoleProvider.model_rebuild()