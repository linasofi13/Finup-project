
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.country as country_service
from app.schemas.country import Country, CountryCreate, CountryResponse, CountryUpdate
from app.models.country import Country as CountryModel


router = APIRouter()

tag_name="Countries"

@router.post("/", response_model=CountryResponse, tags=[tag_name])
async def create_country(country_data: CountryCreate, db: Session = Depends(get_db)):
    return country_service.create_country(db, country_data)

@router.get("/", response_model=List[CountryResponse], tags=[tag_name])
async def get_countries(db: Session = Depends(get_db)):
    return country_service.get_countries(db)

@router.put("/{country_id}", response_model=CountryResponse, tags=[tag_name])
async def update_country(country_id: int, country_data: CountryUpdate, db: Session = Depends(get_db)):
    db_country= country_service.update_country(db, country_id, country_data)
    if not db_country:
        raise HTTPException(status_code=404, detail="Country not found")
    return db_country

@router.delete("/{country_id}", response_model=CountryResponse, tags=[tag_name])
async def delete_country(country_id: int, db: Session = Depends(get_db)):
    country = country_service.get_country_by_id(db, country_id)
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country_service.delete_country(db, country_id)


