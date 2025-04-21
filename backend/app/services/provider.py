from sqlalchemy.orm import Session

from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderResponse


def create_provider(db: Session, provider_data: ProviderCreate):
    db_provider = Provider(**provider_data.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

def transform_provider(provider):
    role_provider = provider.role_providers[0] if provider.role_providers else None
    role = role_provider.role if role_provider else None
    country = role_provider.country if role_provider else None

    return ProviderResponse(
        id=provider.id,
        name=provider.name,
        email=provider.email,
        company=provider.company,
        role=role.name if role else None,
        cost_usd=role_provider.price_usd if role_provider else None,
        country=country.name if country else None,
        category=role.category_role.name if role and role.category_role else None,
        category_provider=provider.category_provider.name if provider.category_provider else None,
        line=provider.category_line.name if provider.category_line else None,
    )

def get_provider_by_id(db: Session, provider_id: int):
    return db.query(Provider).filter(Provider.id == provider_id).first()


def get_providers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Provider).offset(skip).limit(limit).all()


def update_provider(
    db: Session, provider_id: int, provider_update_data: ProviderUpdate
):
    db_provider = get_provider_by_id(db, provider_id)
    if db_provider:
        for key, value in provider_update_data.dict(exclude_unset=True).items():
            setattr(db_provider, key, value)
        db.commit()
        db.refresh(db_provider)
    return db_provider


def delete_provider(db: Session, provider_id: int):
    db_provider = get_provider_by_id(db, provider_id)
    if db_provider:
        db.delete(db_provider)
        db.commit()
    return db_provider
