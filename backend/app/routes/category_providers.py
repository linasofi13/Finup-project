
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.category_provider as category_provider_service
from app.schemas.category_provider import CategoryProvider, CategoryProviderCreate, CategoryProviderResponse, CategoryProviderUpdate
from app.models.category_provider import CategoryProvider as CategoryProviderModel


router = APIRouter()

tag_name="Category Providers"

@router.post("/", response_model=CategoryProviderResponse, tags=[tag_name])
async def create_category_provider(category_provider_data: CategoryProviderCreate, db: Session = Depends(get_db)):
    return category_provider_service.create_category_provider(db, category_provider_data)

@router.get("/", response_model=List[CategoryProviderResponse], tags=[tag_name])
async def get_category_providers(db: Session = Depends(get_db)):
    return category_provider_service.get_category_providers(db)

@router.put("/{category_provider_id}", response_model=CategoryProviderResponse, tags=[tag_name])
async def update_category_provider(category_provider_id: int, category_provider_data: CategoryProviderUpdate, db: Session = Depends(get_db)):
    db_category_provider= category_provider_service.update_category_provider(db, category_provider_id, category_provider_data)
    if not db_category_provider:
        raise HTTPException(status_code=404, detail="CategoryProvider not found")
    return db_category_provider

@router.delete("/{category_provider_id}", response_model=CategoryProviderResponse, tags=[tag_name])
async def delete_category_provider(category_provider_id: int, db: Session = Depends(get_db)):
    category_provider = category_provider_service.get_category_provider_by_id(db, category_provider_id)
    if not category_provider:
        raise HTTPException(status_code=404, detail="CategoryProvider not found")
    return category_provider_service.delete_category_provider(db, category_provider_id)


