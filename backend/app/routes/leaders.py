from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.leader import TechnicalLeader, FunctionalLeader
from app.schemas.leader import LeaderResponse

router = APIRouter()

@router.get("/technical-leaders", response_model=List[LeaderResponse])
def get_technical_leaders(db: Session = Depends(get_db)):
    return db.query(TechnicalLeader).all()

@router.get("/functional-leaders", response_model=List[LeaderResponse])
def get_functional_leaders(db: Session = Depends(get_db)):
    return db.query(FunctionalLeader).all()