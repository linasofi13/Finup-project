from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entorno import Entorno
from app.schemas.entorno import EntornoResponse

router = APIRouter()

@router.get("/entornos/", response_model=List[EntornoResponse])
def get_entornos(db: Session = Depends(get_db)):
    return db.query(Entorno).all()