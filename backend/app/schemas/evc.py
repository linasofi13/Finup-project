from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel

if TYPE_CHECKING:
    from .entorno import Entorno
    from .evc_q import EVC_Q
    from .functional_leader import FunctionalLeader
    from .technical_leader import TechnicalLeader
    from .entorno import Entorno

class EVCBase(BaseModel):
    name: str
    description: str  # Changed from 'description' to 'project' to match the model
    entorno_id: int
    functional_leader_id: int
    technical_leader_id: int

class EVCCreate(EVCBase):
    status:bool = True

# class EVCUpdate(BaseModel):
#     name: Optional[str] = None
#     project: Optional[str] = None  # Changed from 'description' to 'project'
#     technical_leader_id: Optional[int] = None
#     functional_leader_id: Optional[int] = None
#     entorno_id: Optional[int] = None

class EVC(EVCBase):
    id: int
    creation_date: datetime  # Will be auto-set by the database (func.now())
    updated_at: datetime   # Will be auto-set and updated by the database
    
    # Relationships to EVC
    technical_leader: Optional["TechnicalLeader"] = None
    functional_leader: Optional["FunctionalLeader"] = None
    entorno: Optional["Entorno"] = None
    
    #Relationships from EVC
    
    evc_qs: List["EVC_Q"] = []
    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

class EVCResponse(EVCBase):
    id: int
    status: bool
    creation_date: datetime  # Will be auto-set by the database (func.now())
    updated_at: datetime   # Will be auto-set and updated by the database