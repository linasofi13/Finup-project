from sqlalchemy.orm import Session
from app.models import Entorno
from app.schemas import EntornoCreate

def create_entorno(db: Session, entorno_data: EntornoCreate):
    db_entorno= Entorno(**entorno_data.dict())
    db.add(db_entorno)
    db.commit()
    db.refresh(db_entorno)
    return db_entorno
  
def get_entornos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Entorno).offset(skip).limit(limit).all()