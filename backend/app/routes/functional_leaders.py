from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db


import app.services.functional_leader as functional_leader_service
from app.models.functional_leader import FunctionalLeader
from app.schemas.functional_leader import FunctionalLeaderCreate, FunctionalLeader as FunctionalLeaderResponse

router= APIRouter()

tag_name="Functional Leaders"

@router.get("/functional-leaders", response_model=list[FunctionalLeaderResponse], tags=[tag_name])
async def get_functional_leaders(db: Session = Depends(get_db)):
    return functional_leader_service.get_functional_leaders(db)

@router.post("/functional-leaders", response_model=FunctionalLeaderResponse, tags=[tag_name])
async def create_new_functional_leader(functional_leader_data:FunctionalLeaderCreate, db:Session=Depends(get_db)):
    return functional_leader_service.create_functional_leader(db, functional_leader_data)

