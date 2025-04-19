from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel

if TYPE_CHECKING:
    from .entorno import Entorno
    from .evc_q import EVC_Q, EVC_QShortResponse
    from .functional_leader import FunctionalLeader
    from .technical_leader import TechnicalLeader
    from .entorno import Entorno, EntornoResponse

class EVCBase(BaseModel):
    name: str
    description: str  # Changed from 'description' to 'project' to match the model

    entorno_id: Optional[int]= None
    functional_leader_id: Optional[int]= None
    technical_leader_id: Optional[int]=None

class EVCCreate(EVCBase):
    status:bool = True

class EVC(EVCBase):
    id: int
    creation_date: datetime  # Will be auto-set by the database (func.now())
    updated_at: datetime   # Will be auto-set and updated by the database
    
    # Relationships to EVC
    technical_leader: Optional["TechnicalLeader"] = None
    functional_leader: Optional["FunctionalLeader"] = None
    entorno: Optional["EntornoResponse"] = None
    
    #Relationships from EVC
    
    evc_qs: Optional[List["EVC_Q"]] = None
    class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

class EVCUpdate(EVCBase):
    name: Optional[str] = None
    description: Optional[str] = None 
    entorno_id: Optional[int] = None
    functional_leader_id: Optional[int] = None
    technical_leader_id: Optional[int] = None
    status: Optional[bool] = None
    class Config:
        from_attributes = True
class EVCResponse(EVCBase):
    id: int
    name: str
    description: str  # Changed from 'description' to 'project' to match the model
    functional_leader_id: Optional[int ] = None
    technical_leader_id: Optional[int] = None
    entorno_id: Optional[int] = None
    status: bool
    creation_date: datetime  # Will be auto-set by the database (func.now())
    updated_at: datetime   # Will be auto-set and updated by the database
    evc_qs: Optional[List[EVC_QShortResponse]] = None
    def get_technical_leader(self):
        if self.technical_leader_id:
            from app.services import technical_leader as technical_leader_service
            return technical_leader_service.get_technical_leader_by_id(self.technical_leader_id)
        
    def get_functional_leader(self):
        if self.functional_leader_id:
            from app.services import functional_leader as functional_leader_service
            return functional_leader_service.get_functional_leader_by_id(self.functional_leader_id)
    def get_entorno(self):
        if self.entorno_id:
            from app.services import entorno as entorno_service
            return entorno_service.get_entorno_by_id(self.entorno_id)