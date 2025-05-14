from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class BudgetAllocationBase(BaseModel):
    budget_pocket_id: int
    evc_id: int
    allocated_value: float
    is_total_allocation: Optional[bool] = False  # Indica si es una asignación total
    comments: Optional[str] = None


class BudgetAllocationCreate(BudgetAllocationBase):
    pass


class BudgetAllocationUpdate(BaseModel):
    budget_pocket_id: Optional[int] = None
    evc_id: Optional[int] = None
    allocated_value: Optional[float] = None
    is_total_allocation: Optional[bool] = None
    comments: Optional[str] = None


class EVC(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class BudgetAllocation(BudgetAllocationBase):
    id: int
    allocation_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetAllocationResponse(BudgetAllocation):
    evc: EVC

    class Config:
        from_attributes = True
