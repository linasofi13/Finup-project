# app/routes/evcs.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.evc import EVCCreate, EVCResponse, EVCUpdate
from app.services import evcs as evc_service

router = APIRouter()

tag_name = "EVCs"


@router.post("/evcs/", response_model=EVCResponse, tags=[tag_name])
async def create_evc(evc_data: EVCCreate, db: Session = Depends(get_db)):
    return evc_service.create_evc(db, evc_data)


@router.get("/evcs/", response_model=list[EVCResponse], tags=[tag_name])
def list_evcs(db: Session = Depends(get_db)):
    return evc_service.get_evcs(db)


@router.get("/evcs/{evc_id}", response_model=EVCResponse, tags=[tag_name])
async def get_evc(evc_id: int, db: Session = Depends(get_db)):
    db_evc = evc_service.get_evc_by_id(db, evc_id)
    if not db_evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return db_evc


@router.put("/evcs/{evc_id}", response_model=EVCResponse, tags=[tag_name])
async def update_evc(evc_id: int, evc_data: EVCUpdate, db: Session = Depends(get_db)):
    db_evc = evc_service.update_evc(db, evc_id, evc_data)
    if not db_evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    for key, value in evc_data.dict(exclude_unset=True).items():
        setattr(db_evc, key, value)
    db.commit()
    db.refresh(db_evc)
    return db_evc


@router.delete("/evcs/{evc_id}", response_model=EVCResponse, tags=[tag_name])
async def delete_evc(evc_id: int, db: Session = Depends(get_db)):
    db_evc = evc_service.delete_evc(db, evc_id)
    if not db_evc:
        raise HTTPException(status_code=404, detail="EVC not found")
    return db_evc
