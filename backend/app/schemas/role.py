from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .category_role import CategoryRole
    from .role_provider import RoleProvider


class RoleBase(BaseModel):
    name: str
    category_role_id: int
class RoleCreate(RoleBase):
    pass
class Role(RoleBase):
  id : int
  #Relationships from Role
  role_providers: List["RoleProvider"] = Field(default_factory=list)  # Assuming RoleProvider is defined elsewhere
  #Relationships to Role
  category_role: Optional["CategoryRole"] = None  # Assuming CategoryRole is defined elsewhere
  class Config:
        from_attributes = True  # This replaces orm_mode=True in Pydantic v2

# from .category_role import CategoryRole
# from .role_provider import RoleProvider
# Role.model_rebuild()