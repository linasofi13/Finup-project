from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import budget_allocation as crud
from app.schemas.budget_allocation import (
    BudgetAllocation,
    BudgetAllocationCreate,
    BudgetAllocationUpdate,
    BudgetAllocationResponse,
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[BudgetAllocationResponse])
def read_budget_allocations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    allocations = crud.get_budget_allocations(db, skip=skip, limit=limit)
    return allocations


@router.get("/{allocation_id}", response_model=BudgetAllocationResponse)
def read_budget_allocation(allocation_id: int, db: Session = Depends(get_db)):
    db_allocation = crud.get_budget_allocation(db, allocation_id=allocation_id)
    if db_allocation is None:
        raise HTTPException(status_code=404, detail="Budget allocation not found")
    return db_allocation


@router.get("/pocket/{budget_pocket_id}", response_model=List[BudgetAllocationResponse])
def read_budget_allocations_by_pocket(
    budget_pocket_id: int, db: Session = Depends(get_db)
):
    try:
        allocations = crud.get_budget_allocations_by_pocket(
            db, budget_pocket_id=budget_pocket_id
        )
        # Convert SQLAlchemy objects to Pydantic models
        allocations_data = [
            BudgetAllocationResponse.model_validate(allocation)
            for allocation in allocations
        ]
        logger.info(f"Allocations by pocket response: {allocations_data}")
        return allocations_data
    except Exception as e:
        logger.error(
            f"Error in read_budget_allocations_by_pocket: {str(e)}", exc_info=True
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/evc/{evc_id}", response_model=List[BudgetAllocationResponse])
def read_budget_allocations_by_evc(evc_id: int, db: Session = Depends(get_db)):
    allocations = crud.get_budget_allocations_by_evc(db, evc_id=evc_id)
    return allocations


@router.post("/", response_model=BudgetAllocationResponse)
def create_budget_allocation(
    allocation: BudgetAllocationCreate, db: Session = Depends(get_db)
):
    return crud.create_budget_allocation(db=db, allocation=allocation)


@router.put("/{allocation_id}", response_model=BudgetAllocationResponse)
def update_budget_allocation(
    allocation_id: int,
    allocation: BudgetAllocationUpdate,
    db: Session = Depends(get_db),
):
    db_allocation = crud.update_budget_allocation(
        db=db, allocation_id=allocation_id, allocation=allocation
    )
    if db_allocation is None:
        raise HTTPException(status_code=404, detail="Budget allocation not found")
    return db_allocation


@router.delete("/{allocation_id}")
def delete_budget_allocation(allocation_id: int, db: Session = Depends(get_db)):
    success = crud.delete_budget_allocation(db=db, allocation_id=allocation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget allocation not found")
    return {"message": "Budget allocation deleted successfully"}
