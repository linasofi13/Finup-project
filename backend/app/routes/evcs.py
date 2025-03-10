from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.evc import EVC  # Assuming you have an EVC model defined
from app.schemas.evc import EVCCreate, EVCResponse
from app.services.evc_service import create_evc, get_evcs, get_evc, delete_evc

router = APIRouter()

@router.post("/evcs/", response_model=EVCResponse, tags=["EVCs"])
async def create_new_evc(evc_data: EVCCreate, db: Session = Depends(get_db)):
    """Create a new EVC."""
    return create_evc(db, evc_data)

@router.get("/evcs/", response_model=List[EVCResponse], tags=["EVCs"])
async def list_evcs(db: Session = Depends(get_db)):
    """Retrieve all EVCs."""
    return get_evcs(db)

@router.get("/evcs/{evc_id}", response_model=EVCResponse, tags=["EVCs"])
async def retrieve_evc(evc_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific EVC."""
    evc = get_evc(db, evc_id)
    if not evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return evc

@router.delete("/evcs/{evc_id}", tags=["EVCs"])
async def remove_evc(evc_id: int, db: Session = Depends(get_db)):
    """Delete an EVC by ID."""
    evc = delete_evc(db, evc_id)
    if not evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return {"message": "EVC deleted successfully"}
