from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
if TYPE_CHECKING:
    from .provider import Provider

class CategoryProviderBase(BaseModel):
    name: str
class CategoryProviderCreate(CategoryProviderBase):
    pass
class CategoryProvider(CategoryProviderBase):
  id : int
  #Relationships from CategoryProvider
  providers: List["Provider"] = Field(default_factory=list) # Assuming Provider is defined elsewhere  
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

class CategoryProviderUpdate(CategoryProviderBase):
    name: Optional[str] = None
    class Config:
        from_attributes = True
class CategoryProviderResponse(CategoryProviderBase):
    id: int
    name: str
    