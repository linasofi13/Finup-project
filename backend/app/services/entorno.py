from sqlalchemy.orm import Session

from app.models.entorno import Entorno
from app.schemas.entorno import EntornoCreate

def create_entorno(db: Session, entorno_data: EntornoCreate):
    db_entorno = Entorno(**entorno_data.dict())
    db.add(db_entorno)
    db.commit()
    db.refresh(db_entorno)
    return db_entorno
def get_entornos(db: Session, skip: int = 0, limit: int = 100):
  return db.query(Entorno).offset(skip).limit(limit).all()

def get_entorno_by_id(db: Session, entorno_id: int):
    return db.query(Entorno).filter(Entorno.id == entorno_id).first()

def update_entorno(db: Session, entorno_id: int, entorno_data: EntornoCreate):
  db_entorno=get_entorno_by_id(db, entorno_id)
  if not db_entorno:
    return None
  for key, value in entorno_data.dict(exclude_unset=True).items():
    setattr(db_entorno, key, value)
  db.commit()
  db.refresh(db_entorno)
  return db_entorno

def delete_entorno(db:Session, entorno_id: int):
    db_entorno = get_entorno_by_id(db, entorno_id)
    if not db_entorno:
        return None
    db.delete(db_entorno)
    db.commit()
    return db_entorno