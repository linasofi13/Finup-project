from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .evc_q import EVC_Q
    from .provider import ProviderResponse


class EVC_FinancialBase(BaseModel):
    evc_q_id: int


class EVC_FinancialCreate(EVC_FinancialBase):
    provider_id: int


class EVC_FinancialCreateConcept(EVC_FinancialBase):
    concept: str
    value_usd: float


class EVC_Financial(EVC_FinancialBase):
    id: int
    provider_id: Optional[int] = None
    created_at: datetime
    # Relationships to EVC_Financial
    evc_q: Optional["EVC_Q"] = None  # Assuming EVC_Q is defined elsewhere
    role_provider: Optional[
        "ProviderResponse"
    ] = None  # Assuming RoleProvider is defined elsewhere

    concept: Optional[str] = None
    value_usd: Optional[float] = None

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class EVC_FinancialResponse(EVC_FinancialBase):
    id: int
    provider_id: Optional[int] = None
    provider: Optional[
        "ProviderResponse"
    ] = None  # Assuming RoleProvider is defined elsewhere
    concept: Optional[str] = None
    value_usd: Optional[float] = None
    created_at: datetime


class EVC_FinancialUpdate(EVC_FinancialBase):
    evc_q_id: Optional[int] = None
    provider_id: Optional[int] = None
