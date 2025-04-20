from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db


from app.services import entorno as entorno_service
from app.models.entorno import Entorno
from app.schemas.entorno import EntornoCreate, Entorno, EntornoResponse, EntornoUpdate

tag_name = "Entornos"
router = APIRouter()

tag_name = "Entornos"


@router.post("/entornos/", response_model=EntornoResponse, tags=[tag_name])
def create_new_entorno(entorno_data: EntornoCreate, db: Session = Depends(get_db)):
    return entorno_service.create_entorno(db, entorno_data)


@router.get("/entornos/", response_model=list[EntornoResponse], tags=[tag_name])
def get_entornos(db: Session = Depends(get_db)):
    return entorno_service.get_entornos(db)


@router.put("/entornos/{entorno_id}", response_model=EntornoResponse, tags=[tag_name])
def update_entorno(
    entorno_id: int, entorno_data: EntornoUpdate, db: Session = Depends(get_db)
):
    db_entorno = entorno_service.get_entorno_by_id(db, entorno_id)
    if not db_entorno:
        raise HTTPException(status_code=404, detail="Entorno not found")
    return entorno_service.update_entorno(db, entorno_id, entorno_data)


@router.delete(
    "/entornos/{entorno_id}", response_model=EntornoResponse, tags=[tag_name]
)
def delete_entorno(entorno_id: int, db: Session = Depends(get_db)):
    db_entorno = entorno_service.get_entorno_by_id(db, entorno_id)
    if not db_entorno:
        raise HTTPException(status_code=404, detail="Entorno not found")

    ## Check if the entorno is used in any EVC
    return db_entorno
