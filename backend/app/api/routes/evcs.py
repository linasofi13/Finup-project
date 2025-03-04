from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.evc_service import create_evc, get_evcs, get_evc, delete_evc
from app.schemas.evc import EVCCreate, EVCResponse

router = APIRouter()

@router.post("/evcs/", response_model=EVCResponse, tags=["EVCs"])
def create_new_evc(evc_data: EVCCreate, db: Session = Depends(get_db)):
    """Create a new EVC."""
    return create_evc(db, evc_data)

@router.get("/evcs/", response_model=list[EVCResponse], tags=["EVCs"])
def list_evcs(db: Session = Depends(get_db)):
    """Retrieve all EVCs."""
    return get_evcs(db)

@router.get("/evcs/{evc_id}", response_model=EVCResponse, tags=["EVCs"])
def retrieve_evc(evc_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific EVC."""
    evc = get_evc(db, evc_id)
    if not evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return evc

@router.delete("/evcs/{evc_id}", tags=["EVCs"])
def remove_evc(evc_id: int, db: Session = Depends(get_db)):
    """Delete an EVC by ID."""
    evc = delete_evc(db, evc_id)
    if not evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return {"message": "EVC deleted successfully"}
