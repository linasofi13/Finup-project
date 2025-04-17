
from sqlalchemy.orm import Session

from app.models.role_provider import RoleProvider
from app.schemas.role_provider import RoleProviderCreate, RoleProviderUpdate

def create_role_provider(db: Session, role_provider_data: RoleProviderCreate):
    db_role_provider = RoleProvider(**role_provider_data.dict())
    db.add(db_role_provider)
    db.commit()
    db.refresh(db_role_provider)
    return db_role_provider

def get_role_provider_by_id(db: Session, role_provider_id: int):
    return db.query(RoleProvider).filter(RoleProvider.id == role_provider_id).first()

def get_role_providers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RoleProvider).offset(skip).limit(limit).all()

def update_role_provider(db: Session, role_provider_id: int, role_provider_update_data: RoleProviderUpdate):
    db_role_provider = get_role_provider_by_id(db, role_provider_id)
    if db_role_provider:
        for key, value in role_provider_update_data.dict(exclude_unset=True).items():
            setattr(db_role_provider, key, value)
        db.commit()
        db.refresh(db_role_provider)
    return db_role_provider

def delete_role_provider(db: Session, role_provider_id: int):
    db_role_provider = get_role_provider_by_id(db, role_provider_id)
    if db_role_provider:
        db.delete(db_role_provider)
        db.commit()
    return db_role_provider