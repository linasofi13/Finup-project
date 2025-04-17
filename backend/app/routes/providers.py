from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.provider as provider_service
from app.schemas.provider import Provider, ProviderCreate, ProviderResponse, ProviderUpdate
from app.models.provider import Provider


router = APIRouter()

tag_name="Providers"

@router.post("/", response_model=ProviderResponse, tags=[tag_name])
async def create_provider(provider_data: ProviderCreate, db: Session = Depends(get_db)):
    return provider_service.create_provider(db, provider_data)

@router.get("/", response_model=List[ProviderResponse], tags=[tag_name])
async def get_providers(db: Session = Depends(get_db)):
    return provider_service.get_providers(db)

@router.put("/{provider_id}", response_model=ProviderResponse, tags=[tag_name])
async def update_provider(provider_id: int, provider_data: ProviderUpdate, db: Session = Depends(get_db)):
    db_provider= provider_service.update_provider(db, provider_id, provider_data)
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return db_provider

@router.delete("/{provider_id}", response_model=ProviderResponse, tags=[tag_name])
async def delete_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = provider_service.get_provider_by_id(db, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider_service.delete_provider(db, provider_id)