from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.provider import ProviderCreate, ProviderResponse
from app.models.provider import Provider
from app.services.provider_service import (
    create_provider,
    get_providers,
    get_provider_by_id,
    delete_provider,
)

router = APIRouter(prefix="/providers", tags=["providers"])

@router.get("/", response_model=list[ProviderResponse])
def list_providers(db: Session = Depends(get_db)):
    return get_providers(db)

@router.post("/", response_model=ProviderResponse)
def add_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    return create_provider(db, provider)

@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = get_provider_by_id(db, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.delete("/{provider_id}", response_model=dict)
def remove_provider(provider_id: int, db: Session = Depends(get_db)):
    if not delete_provider(db, provider_id):
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"message": "Provider deleted successfully"}
