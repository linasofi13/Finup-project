from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.provider import ProviderCreate, ProviderResponse
from app.models.provider import Provider
from typing import Optional, List
from app.services.provider_service import (
    create_provider,
    get_providers,
    get_provider_by_id,
    delete_provider,
    update_provider,
    bulk_create_providers,
)
from typing import List

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("/distinct-companies", response_model=List[str])
def get_distinct_companies(db: Session = Depends(get_db)):
    companies = db.query(Provider.company).distinct().all()
    return [c[0] for c in companies if c[0]]


@router.get("/distinct-countries", response_model=List[str])
def get_distinct_countries(db: Session = Depends(get_db)):
    countries = db.query(Provider.country).distinct().all()
    return [c[0] for c in countries if c[0]]


@router.get("/filter", response_model=List[ProviderResponse])
def filter_providers(
    db: Session = Depends(get_db),
    company: Optional[str] = None,
    country: Optional[str] = None,
    line: Optional[str] = None,
    cost_min: float = 0.0,
    cost_max: float = 9999999.0,
) -> List[ProviderResponse]:
    query = db.query(Provider)
    if company:
        query = query.filter(Provider.company.ilike(f"%{company}%"))
    if country:
        query = query.filter(Provider.country.ilike(f"%{country}%"))
    if line:
        query = query.filter(Provider.line.ilike(f"%{line}%"))
    query = query.filter(Provider.cost_usd >= cost_min, Provider.cost_usd <= cost_max)
    return query.all()


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
def update_provider_route(
    provider_id: int, provider_data: ProviderCreate, db: Session = Depends(get_db)
):
    provider = update_provider(db, provider_id, provider_data)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post("/bulk-upload")
def bulk_upload_providers(
    providers: List[ProviderCreate], db: Session = Depends(get_db)
):
    """Carga masiva de proveedores desde un JSON, evitando duplicados"""
    try:
        added_providers = bulk_create_providers(db, providers)
        return {"message": f"{len(added_providers)} proveedores subidos exitosamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al procesar la carga: {str(e)}"
        )
