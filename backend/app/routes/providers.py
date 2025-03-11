from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.provider import ProviderCreate, ProviderResponse
from app.services.provider_service import (
    create_provider,
    get_providers,
    get_provider_by_id,
    delete_provider,
    update_provider,
    bulk_create_providers
)
from typing import List

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("/", response_model=List[ProviderResponse])


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

@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider_route(provider_id: int, provider_data: ProviderCreate, db: Session = Depends(get_db)):
    provider = update_provider(db, provider_id, provider_data)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.post("/bulk-upload")
def bulk_upload_providers(providers: List[ProviderCreate], db: Session = Depends(get_db)):
    """Carga masiva de proveedores desde un JSON, evitando duplicados"""
    try:
        added_providers = bulk_create_providers(db, providers)
        return {"message": f"{len(added_providers)} proveedores subidos exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la carga: {str(e)}")
