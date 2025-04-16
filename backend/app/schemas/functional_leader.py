from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
  from .evc import EVC
  from .entorno import Entorno, EntornoResponse
# from app.schemas import EVC, Entorno
class FunctionalLeaderBase(BaseModel):
  name: str
  email: str
  
class FunctionalLeaderCreate(FunctionalLeaderBase):
  pass
class FunctionalLeader(FunctionalLeaderBase):
  id: int
  evcs: Optional[List["EVC"]] = None
  entornos: Optional[List["Entorno"]] = None
  entry_date: datetime

  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
        
class FunctionalLeaderUpdate(FunctionalLeaderBase):
  name: Optional[str] = None
  email: Optional[str] = None
  class Config:
    from_attributes = True  # This replaces orm_mode=True in Pydantic v2

class FunctionalLeaderResponse(FunctionalLeaderBase):
  id:int
  entornos: Optional[List["EntornoResponse"]] = None  # Assuming EntornoResponse is defined elsewhere


