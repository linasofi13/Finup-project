from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db


import app.services.functional_leader as functional_leader_service
from app.models.functional_leader import FunctionalLeader
from app.schemas.functional_leader import (
    FunctionalLeaderCreate,
    FunctionalLeaderResponse,
)

router = APIRouter()

tag_name = "Functional Leaders"


@router.post(
    "/functional-leaders", response_model=FunctionalLeaderResponse, tags=[tag_name]
)
async def create_new_functional_leader(
    functional_leader_data: FunctionalLeaderCreate, db: Session = Depends(get_db)
):
    return functional_leader_service.create_functional_leader(
        db, functional_leader_data
    )


@router.get(
    "/functional-leaders",
    response_model=list[FunctionalLeaderResponse],
    tags=[tag_name],
)
async def get_functional_leaders(db: Session = Depends(get_db)):
    return functional_leader_service.get_functional_leaders(db)


@router.put(
    "/functional-leaders/{functional_leader_id}",
    response_model=FunctionalLeaderResponse,
    tags=[tag_name],
)
async def update__functional_leader(
    functional_leader_id: int,
    functional_leader_data: FunctionalLeaderCreate,
    db: Session = Depends(get_db),
):
    db_functional_leader = functional_leader_service.update_functional_leader(
        db, functional_leader_id, functional_leader_data
    )
    if not db_functional_leader:
        raise HTTPException(status_code=404, detail="Functional Leader not found")
    return db_functional_leader


@router.delete(
    "/functional-leaders/{functional_leader_id}",
    response_model=FunctionalLeaderResponse,
    tags=[tag_name],
)
async def delete_functional_leader(
    functional_leader_id: int, db: Session = Depends(get_db)
):
    db_functional_leader = functional_leader_service.delete_functional_leader(
        db, functional_leader_id
    )
    if not db_functional_leader:
        raise HTTPException(status_code=404, detail="Functional Leader not found")
    return db_functional_leader
