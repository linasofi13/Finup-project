from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .evc import EVC
    from .entorno import Entorno


class TechnicalLeaderBase(BaseModel):
  name: str
  email: str
  
class TechnicalLeaderCreate(TechnicalLeaderBase):
  pass
class TechnicalLeader(TechnicalLeaderBase):
  id: int
  evcs: Optional[List["EVC"]] = []
  entornos: Optional[List["Entorno"]] = []
  entry_date: datetime

  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
