from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, Field
from datetime import datetime

if TYPE_CHECKING:
    from .evc import EVC
    from .evc_financial import EVC_Financial, EVC_FinancialResponse


class EVC_QBase(BaseModel):
    evc_id: int
    year: int
    q: int
    allocated_budget: float
    allocated_percentage: float


class EVC_QCreate(EVC_QBase):
    pass


class EVC_Q(EVC_QBase):
    id: int

    # Relationships to EVC_Q
    evc: Optional["EVC"] = None
    # Relationships from EVC_Q
    evc_financials: List["EVC_Financial"] = Field(
        default_factory=list
    )  # Assuming EVC_Financial is defined elsewhere

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class EVC_QShortResponse(EVC_QBase):
    id: int
    year: Optional[int] = None
    q: Optional[int] = None
    allocated_budget: Optional[float] = None
    allocated_percentage: Optional[float] = None


class EVC_QResponse(EVC_QShortResponse):
    evc_id: Optional[int] = None
    evc_financials: Optional[List[EVC_FinancialResponse]] = None  #


class EVC_QUpdate(EVC_QBase):
    id: int
    evc_id: Optional[int] = None
    year: Optional[int] = None
    q: Optional[int] = None
    allocated_budget: Optional[float] = None
    allocated_percentage: Optional[float] = None

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
