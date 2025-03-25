# app/schemas/evc.py
from pydantic import BaseModel
from typing import List, Optional


class EVCProviderCreate(BaseModel):
    provider_id: int
    role_name: Optional[str] = None  # Rol personalizado para este provider


class EVCBase(BaseModel):
    name: str
    project: Optional[str] = None
    environment: Optional[str] = None
    q1_budget: float = 0.0
    q2_budget: float = 0.0
    q3_budget: float = 0.0
    q4_budget: float = 0.0
    description: Optional[str] = None


class EVCCreate(EVCBase):
    # Lista de proveedores asignados
    providers: List[EVCProviderCreate] = []


class EVCResponse(EVCBase):
    id: int

    class Config:
        orm_mode = True
