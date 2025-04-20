from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .evc_q import EVC_Q
    from .role_provider import RoleProvider


class EVC_FinancialBase(BaseModel):
    evc_q_id: int
    role_provider_id: Optional[int] = None


class EVC_FinancialCreate(EVC_FinancialBase):
    pass


class EVC_Financial(EVC_FinancialBase):
    id: int

    # Relationships to EVC_Financial
    evc_q: Optional["EVC_Q"] = None  # Assuming EVC_Q is defined elsewhere
    role_provider: Optional[
        "RoleProvider"
    ] = None  # Assuming RoleProvider is defined elsewhere

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class EVC_FinancialShortResponse(EVC_FinancialBase):
    id: int
    # role_provider_id: Optional[int] = None
    # role_provider: Optional["RoleProviderShortResponse"] = None  # Assuming RoleProvider is defined elsewhere


class EVC_FinancialUpdate(EVC_FinancialBase):
    evc_q_id: Optional[int] = None
    role_provider_id: Optional[int] = None
