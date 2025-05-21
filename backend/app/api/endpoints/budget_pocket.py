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
        # Verify budget pocket exists
        budget_pocket = crud.get_budget_pocket(db, budget_pocket_id)
        if not budget_pocket:
            raise HTTPException(status_code=404, detail="Budget pocket not found")

        # Check if budget pocket is available
        if not budget_pocket.is_available:
            # If it's a total allocation, the subsequent logic in this function
            # will correctly determine if there's truly no budget left (db_remaining_budget <= 0)
            # and raise "No remaining budget to allocate...".
            # If it's a partial allocation, then "not available" is a definitive block at this stage.
            if not allocation.is_total_allocation:
                raise HTTPException(
                    status_code=400,
                    detail="Budget pocket is not available for allocation",
                )
            # If allocation.is_total_allocation is true and pocket is not available,
            # we let the code proceed to the db_remaining_budget check.

        db_total_allocated = budget_pocket.total_allocated or 0
        db_remaining_budget = budget_pocket.agreed_value - db_total_allocated

        if allocation.is_total_allocation:
            if db_remaining_budget <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="No remaining budget to allocate. Budget may be already full or its agreed value is zero.",
                )
            allocation.allocated_value = (
                db_remaining_budget  # Override with server-calculated remaining
            )
        else:
            # For partial allocations, validate the client-provided amount
            if (
                not isinstance(allocation.allocated_value, (int, float))
                or allocation.allocated_value <= 0
            ):
                raise HTTPException(
                    status_code=400, detail="Allocated value must be a positive number."
                )
            if allocation.allocated_value > db_remaining_budget:
                raise HTTPException(
                    status_code=400,
                    detail=f"El monto de la asignación excede el presupuesto disponible. Disponible: {db_remaining_budget}",
                )

        # Ensure budget_pocket_id is set on the allocation schema to be passed to CRUD
        allocation.budget_pocket_id = budget_pocket_id

        # Create the allocation - this CRUD function also updates budget_pocket totals and availability
        result = allocation_crud.create_budget_allocation(db=db, allocation=allocation)

        # The budget_pocket's total_allocated and is_available are handled by allocation_crud.create_budget_allocation
        # No need for the explicit update_budget_pocket call that was here previously.

        logger.info(
            f"Created budget allocation: {BudgetAllocationResponse.model_validate(result).model_dump()}"
        )  # Use model_dump() for Pydantic models
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in allocate_budget_to_evc: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
