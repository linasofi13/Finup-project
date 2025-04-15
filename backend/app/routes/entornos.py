from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db


from app.models.entorno import Entorno
import app.services.entorno as entorno_service
from app.schemas.entorno import EntornoCreate, Entorno as EntornoResponse

tag_name="Entornos"
router = APIRouter()

@router.get("/entornos/", response_model=List[EntornoResponse], tags=[tag_name])
def get_entornos(db: Session = Depends(get_db)):
    return entorno_service.get_entornos(db)

@router.post("/entornos/", response_model=EntornoResponse, tags=[tag_name])
def create_entorno(entorno: EntornoCreate, db: Session = Depends(get_db)):
    return entorno_service.create_entorno(db, entorno)