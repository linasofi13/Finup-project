from __future__ import annotations  # For forward references in type hints
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING

# Conditional imports for type checking to avoid circular dependencies
if TYPE_CHECKING:
    from .evc import EVC
    from .functional_leader import FunctionalLeader
    from .technical_leader import TechnicalLeader


class EntornoBase(BaseModel):
    name: Optional[str] = None
    functional_leader_id: Optional[int] = None
    technical_leader_id: Optional[int] = None


class EntornoCreate(EntornoBase):
    status: bool = True


class Entorno(EntornoBase):
    id: int
    # Relationships from Entorno
    evcs: Optional[List["EVC"]] = None  # Forward reference handled automatically
    # Relationships to Entorno
    functional_leader: Optional["FunctionalLeader"] = None
    technical_leader: Optional["TechnicalLeader"] = None
    creation_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2


class EntornoResponse(EntornoBase):
    id: int
    status: bool
    creation_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EntornoUpdate(EntornoBase):
    name: Optional[str] = None
    functional_leader_id: Optional[int] = None
    technical_leader_id: Optional[int] = None
    status: Optional[bool] = None

    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
