from sqlalchemy.orm import Session
from app.models.provider import Provider
from app.schemas.provider import ProviderCreate


def create_provider(db: Session, provider_data: ProviderCreate):
    """Creates a new provider in the database."""
    provider = Provider(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


def get_providers(db: Session):
    """Returns all providers."""
    return db.query(Provider).all()


def get_provider_by_id(db: Session, provider_id: int):
    """Returns a single provider by ID."""
    return db.query(Provider).filter(Provider.id == provider_id).first()


def delete_provider(db: Session, provider_id: int):
    """Deletes a provider by ID if found."""
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if provider:
        db.delete(provider)
        db.commit()
        return True
    return False
