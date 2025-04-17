from sqlalchemy.orm import Session

from app.models.country import Country
from app.schemas.country import CountryCreate, CountryUpdate

def create_country(db: Session, country_data: CountryCreate):
    db_country = Country(**country_data.dict())
    db.add(db_country)
    db.commit()
    db.refresh(db_country)
    return db_country

def get_country_by_id(db: Session, country_id: int):
    return db.query(Country).filter(Country.id == country_id).first()

def get_countries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Country).offset(skip).limit(limit).all()

def update_country(db: Session, country_id: int, country_update_data: CountryUpdate):
    db_country = get_country_by_id(db, country_id)
    if db_country:
        for key, value in country_update_data.dict(exclude_unset=True).items():
            setattr(db_country, key, value)
        db.commit()
        db.refresh(db_country)
    return db_country

def delete_country(db: Session, country_id: int):
    db_country = get_country_by_id(db, country_id)
    if db_country:
        db.delete(db_country)
        db.commit()
    return db_country