from sqlalchemy.orm import Session

from app.models.category_provider import CategoryProvider
from app.schemas.category_provider import CategoryProviderCreate, CategoryProviderUpdate


def create_category_provider(
    db: Session, category_provider_data: CategoryProviderCreate
):
    db_category_provider = CategoryProvider(**category_provider_data.dict())
    db.add(db_category_provider)
    db.commit()
    db.refresh(db_category_provider)
    return db_category_provider


def get_category_provider_by_id(db: Session, category_provider_id: int):
    return (
        db.query(CategoryProvider)
        .filter(CategoryProvider.id == category_provider_id)
        .first()
    )


def get_category_providers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CategoryProvider).offset(skip).limit(limit).all()


def update_category_provider(
    db: Session,
    category_provider_id: int,
    category_provider_update_data: CategoryProviderUpdate,
):
    db_category_provider = get_category_provider_by_id(db, category_provider_id)
    if db_category_provider:
        for key, value in category_provider_update_data.dict(
            exclude_unset=True
        ).items():
            setattr(db_category_provider, key, value)
        db.commit()
        db.refresh(db_category_provider)
    return db_category_provider


def delete_category_provider(db: Session, category_provider_id: int):
    db_category_provider = get_category_provider_by_id(db, category_provider_id)
    if db_category_provider:
        db.delete(db_category_provider)
        db.commit()
    return db_category_provider
