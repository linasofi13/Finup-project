from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.evc_qs as evc_q_service
from app.models.evc_q import EVC_Q
from app.schemas.evc_q import (
    EVC_QCreate,
    EVC_QResponse,
    EVC_QUpdate,
    EVC_QShortResponse,
)

router = APIRouter()

tag_name = "EVC_Qs"


@router.post("/evc_qs/", response_model=EVC_QResponse, tags=[tag_name])
async def create_evc_q(evc_q_data: EVC_QCreate, db: Session = Depends(get_db)):
    return evc_q_service.create_evc_q(db, evc_q_data)


@router.get("/evc_qs/", response_model=List[EVC_QResponse], tags=[tag_name])
async def get_evc_qs(db: Session = Depends(get_db)):
    return evc_q_service.get_evc_qs(db)

@router.get(
    "/evc_qs/evc/{evc_id}", response_model=List[EVC_QShortResponse], tags=[tag_name]
)
async def get_evc_qs_by_evc_id(evc_id: int, db: Session = Depends(get_db)):
    return evc_q_service.get_evc_qs_by_evc_id(db, evc_id)


@router.put("/evc_qs/{evc_q_id}", response_model=EVC_QResponse, tags=[tag_name])
async def update_evc_q(
    evc_q_id: int, evc_q_data: EVC_QUpdate, db: Session = Depends(get_db)
):
    db_evc_q = evc_q_service.get_evc_q_by_id(db, evc_q_id)
    if not db_evc_q:
        raise HTTPException(status_code=404, detail="EVC_Q not found")
    return evc_q_service.update_evc_q(db, evc_q_id, evc_q_data)


@router.delete("/evc_qs/{evc_q_id}", response_model=EVC_QResponse, tags=[tag_name])
async def delete_evc_q(evc_q_id: int, db: Session = Depends(get_db)):
    db_evc_q = evc_q_service.get_evc_q_by_id(db, evc_q_id)
    if not db_evc_q:
        raise HTTPException(status_code=404, detail="EVC_Q not found")

    ## Check if the entorno is used in any EVC
    return evc_q_service.delete_evc_q(db, evc_q_id)
