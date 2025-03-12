from sqlalchemy.orm import Session
from app.models import Entorno


def create_entorno(db_session: Session, entorno: Entorno) -> Entorno:
    db_session.add(entorno)
    db_session.commit()
    db_session.refresh(entorno)
    return entorno


def get_entorno_by_id(db_session: Session, entorno_id: int) -> Entorno:
    return db_session.query(Entorno).filter(Entorno.id == entorno_id).first()


def get_entorno_by_name(db_session: Session, name: str) -> Entorno:
    return db_session.query(Entorno).filter(Entorno.name == name).first()
