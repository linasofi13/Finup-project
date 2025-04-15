from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .role import Role

class CategoryRoleBase(BaseModel):
  name: str
class CategoryRoleCreate(CategoryRoleBase):
  pass
class CategoryRole(CategoryRoleBase):
  id: int
  #Relationships from CategoryRole
  roles: List["Role"] = Field(default_factory=list)  # Assuming Role is defined elsewhere
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2
        



