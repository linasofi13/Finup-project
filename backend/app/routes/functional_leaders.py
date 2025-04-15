from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.functional_leader import create_functional_leader

from app.models.functional_leader import FunctionalLeader
from app.schemas.functional_leader import FunctionalLeaderCreate, FunctionalLeader as FunctionalLeaderResponse

router= APIRouter()

tag_name="Functional Leaders"

@router.get("/functional-leaders", response_model=list[FunctionalLeaderResponse], tags=[tag_name])
async def get_functional_leaders(db: Session = Depends(get_db)):
    functional_leaders = db.query(FunctionalLeader).all()
    print(functional_leaders)  # or better: print(functional_leaders[0].__dict__)
    return [FunctionalLeaderResponse.model_validate(fl) for fl in functional_leaders]

@router.post("/functional-leaders", response_model=FunctionalLeaderResponse, tags=[tag_name])
async def create_new_functional_leader(functional_leader_data:FunctionalLeaderCreate, db:Session=Depends(get_db)):
    return create_functional_leader(db, functional_leader_data)

