from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.technical_leader as technical_leader_service
from app.models.technical_leader import TechnicalLeader
from app.schemas.technical_leader import TechnicalLeaderCreate, TechnicalLeaderResponse, TechnicalLeaderUpdate

router= APIRouter()

tag_name= "Technical Leaders"

@router.get("/technical-leaders", response_model=list[TechnicalLeaderResponse], tags=[tag_name])
async def get_technical_leaders(db: Session = Depends(get_db)):
    return technical_leader_service.get_technical_leaders(db)
  
  
@router.post("/technical-leaders", response_model=TechnicalLeaderResponse, tags=[tag_name])
async def create_new_technical_leader(technical_leader_data:TechnicalLeaderCreate, db:Session=Depends(get_db)):
    return technical_leader_service.create_technical_leader(db, technical_leader_data)

@router.put("/technical-leaders/{technical_leader_id}", response_model=TechnicalLeaderResponse, tags=[tag_name])
async def update_technical_leader(technical_leader_id:int, technical_leader_data:TechnicalLeaderUpdate, db:Session=Depends(get_db)):
    db_technical_leader= technical_leader_service.update_technical_leader(db, technical_leader_id, technical_leader_data)
    if not db_technical_leader:
        raise HTTPException(status_code=404, detail="Technical Leader not found")
    return db_technical_leader
@router.delete("/technical-leaders/{technical_leader_id}", response_model=TechnicalLeaderResponse, tags=[tag_name])
async def delete_technical_leader(technical_leader_id:int, db:Session=Depends(get_db)):
    db_technical_leader= technical_leader_service.delete_technical_leader(db, technical_leader_id)
    if not db_technical_leader:
        raise HTTPException(status_code=404, detail="Technical Leader not found")
    return db_technical_leader