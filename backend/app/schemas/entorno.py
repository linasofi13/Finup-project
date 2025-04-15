from __future__ import annotations  # For forward references in type hints
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

# Conditional imports for type checking to avoid circular dependencies
if TYPE_CHECKING:
    from .evc import EVC
    from .functional_leader import FunctionalLeader
    from .technical_leader import TechnicalLeader

class EntornoBase(BaseModel):
    nombre: str
    functional_leader_id: Optional[int] = None
    technical_leader_id: Optional[int] = None

class EntornoCreate(EntornoBase):
    status: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(datetime.timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(datetime.timezone.utc))

class Entorno(EntornoBase):
    id: int
    # Relationships from Entorno
    evcs: List[EVC] = Field(default_factory=list)  # Forward reference handled automatically
    # Relationships to Entorno
    functional_leader: Optional["FunctionalLeader"] = None
    technical_leader: Optional["TechnicalLeader"] = None
    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
