from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import budget_pocket as crud
from app.crud import budget_allocation as allocation_crud
from app.schemas.budget_pocket import (
    BudgetPocket,
    BudgetPocketCreate,
    BudgetPocketUpdate,
    BudgetPocketResponse,
)
from app.schemas.budget_allocation import (
    BudgetAllocationCreate,
    BudgetAllocationResponse,
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[BudgetPocketResponse])
def read_budget_pockets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        budget_pockets = crud.get_budget_pockets(db, skip=skip, limit=limit)
        # Log the response data for debugging
        logger.info(f"Budget pockets response: {[p.__dict__ for p in budget_pockets]}")
        return budget_pockets
    except Exception as e:
        logger.error(f"Error in read_budget_pockets: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{budget_pocket_id}", response_model=BudgetPocketResponse)
def read_budget_pocket(budget_pocket_id: int, db: Session = Depends(get_db)):
    try:
        db_budget_pocket = crud.get_budget_pocket(db, budget_pocket_id=budget_pocket_id)
        if db_budget_pocket is None:
            raise HTTPException(status_code=404, detail="Budget pocket not found")
        # Log the response data for debugging
        logger.info(f"Budget pocket response: {db_budget_pocket.__dict__}")
        return db_budget_pocket
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in read_budget_pocket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entorno/{entorno_id}", response_model=List[BudgetPocketResponse])
def read_budget_pockets_by_entorno(entorno_id: int, db: Session = Depends(get_db)):
    try:
        budget_pockets = crud.get_budget_pockets_by_entorno(db, entorno_id=entorno_id)
        # Log the response data for debugging
        logger.info(
            f"Budget pockets by entorno response: {[p.__dict__ for p in budget_pockets]}"
        )
        return budget_pockets
    except Exception as e:
        logger.error(
            f"Error in read_budget_pockets_by_entorno: {str(e)}", exc_info=True
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/year/{year}", response_model=List[BudgetPocketResponse])
def read_budget_pockets_by_year(year: int, db: Session = Depends(get_db)):
    try:
        budget_pockets = crud.get_budget_pockets_by_year(db, year=year)
        # Log the response data for debugging
        logger.info(
            f"Budget pockets by year response: {[p.__dict__ for p in budget_pockets]}"
        )
        return budget_pockets
    except Exception as e:
        logger.error(f"Error in read_budget_pockets_by_year: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=BudgetPocketResponse)
def create_budget_pocket(
    budget_pocket: BudgetPocketCreate, db: Session = Depends(get_db)
):
    try:
        result = crud.create_budget_pocket(db=db, budget_pocket=budget_pocket)
        # Log the response data for debugging
        logger.info(f"Created budget pocket response: {result.__dict__}")
        return result
    except Exception as e:
        logger.error(f"Error in create_budget_pocket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{budget_pocket_id}", response_model=BudgetPocketResponse)
def update_budget_pocket(
    budget_pocket_id: int,
    budget_pocket: BudgetPocketUpdate,
    db: Session = Depends(get_db),
):
    try:
        db_budget_pocket = crud.update_budget_pocket(
            db=db, budget_pocket_id=budget_pocket_id, budget_pocket=budget_pocket
        )
        if db_budget_pocket is None:
            raise HTTPException(status_code=404, detail="Budget pocket not found")
        # Log the response data for debugging
        logger.info(f"Updated budget pocket response: {db_budget_pocket.__dict__}")
        return db_budget_pocket
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_budget_pocket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{budget_pocket_id}")
def delete_budget_pocket(budget_pocket_id: int, db: Session = Depends(get_db)):
    try:
        success = crud.delete_budget_pocket(db=db, budget_pocket_id=budget_pocket_id)
        if not success:
            raise HTTPException(status_code=404, detail="Budget pocket not found")
        return {"message": "Budget pocket deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_budget_pocket: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{budget_pocket_id}/allocate", response_model=BudgetAllocationResponse)
def allocate_budget_to_evc(
    budget_pocket_id: int,
    allocation: BudgetAllocationCreate,
    db: Session = Depends(get_db),
):
    try:
        # Verify budget pocket exists and is available
        budget_pocket = crud.get_budget_pocket(db, budget_pocket_id)
        if not budget_pocket:
            raise HTTPException(status_code=404, detail="Budget pocket not found")

        if not budget_pocket.is_available:
            raise HTTPException(
                status_code=400, detail="Budget pocket is not available for allocation"
            )

        # Ensure total_allocated is not None
        total_allocated = budget_pocket.total_allocated or 0

        # Verify the allocation amount doesn't exceed available budget
        remaining_budget = budget_pocket.agreed_value - total_allocated
        if allocation.allocated_value > remaining_budget:
            raise HTTPException(
                status_code=400,
                detail=f"El monto de la asignación excede el presupuesto disponible. Disponible: {remaining_budget}",
            )

        # Create the allocation
        allocation.budget_pocket_id = budget_pocket_id
        result = allocation_crud.create_budget_allocation(db=db, allocation=allocation)

        # Update the budget pocket's total allocated amount
        crud.update_budget_pocket(
            db=db,
            budget_pocket_id=budget_pocket_id,
            budget_pocket=BudgetPocketUpdate(
                total_allocated=total_allocated + allocation.allocated_value,
                is_available=remaining_budget - allocation.allocated_value > 0,
            ),
        )

        logger.info(f"Created budget allocation: {result.__dict__}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in allocate_budget_to_evc: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
