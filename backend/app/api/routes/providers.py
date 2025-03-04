from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.provider import ProviderCreate, ProviderResponse
from app.services.provider_service import create_provider, get_providers, get_provider_by_id, delete_provider

router = APIRouter(prefix="/providers", tags=["Providers"])

@router.post("/", response_model=ProviderResponse)
def create_provider_api(provider: ProviderCreate, db: Session = Depends(get_db)):
    """Creates a new provider."""
    return create_provider(db, provider)

@router.get("/", response_model=list[ProviderResponse])
def list_providers_api(db: Session = Depends(get_db)):
    """Returns a list of all providers."""
    return get_providers(db)

@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider_api(provider_id: int, db: Session = Depends(get_db)):
    """Returns a single provider by ID."""
    provider = get_provider_by_id(db, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.delete("/{provider_id}")
def delete_provider_api(provider_id: int, db: Session = Depends(get_db)):
    """Deletes a provider by ID."""
    success = delete_provider(db, provider_id)
    if not success:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"message": "Provider deleted successfully"}
