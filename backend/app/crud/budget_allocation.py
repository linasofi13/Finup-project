from sqlalchemy.orm import Session, joinedload
from app.models.budget_allocation import BudgetAllocation
from app.models.budget_pocket import BudgetPocket
from app.schemas.budget_allocation import BudgetAllocationCreate, BudgetAllocationUpdate
from fastapi import HTTPException


def get_budget_allocation(db: Session, allocation_id: int):
    return db.query(BudgetAllocation).options(joinedload(BudgetAllocation.evc)).filter(BudgetAllocation.id == allocation_id).first()


def get_budget_allocations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BudgetAllocation).options(joinedload(BudgetAllocation.evc)).offset(skip).limit(limit).all()


def get_budget_allocations_by_pocket(db: Session, budget_pocket_id: int):
    return db.query(BudgetAllocation).options(joinedload(BudgetAllocation.evc)).filter(BudgetAllocation.budget_pocket_id == budget_pocket_id).all()


def get_budget_allocations_by_evc(db: Session, evc_id: int):
    return db.query(BudgetAllocation).options(joinedload(BudgetAllocation.evc)).filter(BudgetAllocation.evc_id == evc_id).all()


def create_budget_allocation(db: Session, allocation: BudgetAllocationCreate):
    # Get the budget pocket
    budget_pocket = db.query(BudgetPocket).filter(BudgetPocket.id == allocation.budget_pocket_id).first()
    if not budget_pocket:
        raise HTTPException(status_code=404, detail="Budget pocket not found")
    
    # Check if budget pocket is available
    if not budget_pocket.is_available:
        raise HTTPException(status_code=400, detail="Budget pocket is not available for allocation")
    
    # Ensure total_allocated is not None
    if budget_pocket.total_allocated is None:
        budget_pocket.total_allocated = 0
    
    # Calculate new total allocated
    new_total = budget_pocket.total_allocated + allocation.allocated_value
    
    # If this is a total allocation, set the allocated_value to the remaining amount
    if allocation.is_total_allocation:
        remaining = budget_pocket.agreed_value - budget_pocket.total_allocated
        if remaining <= 0:
            raise HTTPException(status_code=400, detail="No remaining budget to allocate")
        allocation.allocated_value = remaining
        new_total = budget_pocket.agreed_value
    
    # Check if allocation would exceed agreed value
    if new_total > budget_pocket.agreed_value:
        raise HTTPException(status_code=400, detail="Allocation would exceed agreed budget value")
    
    # Create the allocation
    db_allocation = BudgetAllocation(**allocation.model_dump())
    db.add(db_allocation)
    
    # Update budget pocket's total_allocated
    budget_pocket.total_allocated = new_total
    
    # If total is reached, mark as unavailable
    if new_total >= budget_pocket.agreed_value:
        budget_pocket.is_available = False
    
    db.commit()
    db.refresh(db_allocation)
    return db.query(BudgetAllocation).options(joinedload(BudgetAllocation.evc)).filter(BudgetAllocation.id == db_allocation.id).first()


def update_budget_allocation(
    db: Session, allocation_id: int, allocation: BudgetAllocationUpdate
):
    db_allocation = get_budget_allocation(db, allocation_id)
    if not db_allocation:
        return None
    
    # Get the budget pocket
    budget_pocket = db.query(BudgetPocket).filter(BudgetPocket.id == db_allocation.budget_pocket_id).first()
    if not budget_pocket:
        raise HTTPException(status_code=404, detail="Budget pocket not found")
    
    # Calculate the difference in allocation
    old_value = db_allocation.allocated_value
    new_value = allocation.allocated_value if allocation.allocated_value is not None else old_value
    
    # If this is a total allocation, set the allocated_value to the remaining amount
    if allocation.is_total_allocation:
        remaining = budget_pocket.agreed_value - (budget_pocket.total_allocated - old_value)
        if remaining <= 0:
            raise HTTPException(status_code=400, detail="No remaining budget to allocate")
        new_value = remaining
    
    # Calculate new total allocated
    new_total = budget_pocket.total_allocated - old_value + new_value
    
    # Check if allocation would exceed agreed value
    if new_total > budget_pocket.agreed_value:
        raise HTTPException(status_code=400, detail="Allocation would exceed agreed budget value")
    
    # Update the allocation
    update_data = allocation.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_allocation, key, value)
    
    # Update budget pocket's total_allocated
    budget_pocket.total_allocated = new_total
    
    # Update availability based on total
    budget_pocket.is_available = new_total < budget_pocket.agreed_value
    
    db.commit()
    db.refresh(db_allocation)
    return db_allocation


def delete_budget_allocation(db: Session, allocation_id: int):
    db_allocation = get_budget_allocation(db, allocation_id)
    if not db_allocation:
        return False
    
    # Get the budget pocket
    budget_pocket = db.query(BudgetPocket).filter(BudgetPocket.id == db_allocation.budget_pocket_id).first()
    if budget_pocket:
        # Update total_allocated
        budget_pocket.total_allocated -= db_allocation.allocated_value
        # Make available if total is less than agreed value
        if budget_pocket.total_allocated < budget_pocket.agreed_value:
            budget_pocket.is_available = True
    
    db.delete(db_allocation)
    db.commit()
    return True 