from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class EntornoBase(BaseModel):
    name: str


class Entorno(EntornoBase):
    id: int

    class Config:
        from_attributes = True


class BudgetPocketBase(BaseModel):
    year: int
    entorno_id: int
    agreed_value: float
    status: bool = True
    is_available: Optional[bool] = True
    total_allocated: Optional[float] = 0.0


class BudgetPocketCreate(BudgetPocketBase):
    pass


class BudgetPocketUpdate(BaseModel):
    year: Optional[int] = None
    entorno_id: Optional[int] = None
    agreed_value: Optional[float] = None
    status: Optional[bool] = None
    is_available: Optional[bool] = None
    total_allocated: Optional[float] = None


class BudgetPocket(BudgetPocketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    entorno: Entorno

    class Config:
        from_attributes = True


class BudgetPocketResponse(BudgetPocket):
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}
