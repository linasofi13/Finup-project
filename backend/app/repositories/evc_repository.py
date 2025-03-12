from sqlalchemy.orm import Session
from app.models import EVC


def create_evc(db_session: Session, evc: EVC) -> EVC:
    db_session.add(evc)
    db_session.commit()
    db_session.refresh(evc)
    return evc


def get_evc_by_id(db_session: Session, evc_id: int) -> EVC:
    return db_session.query(EVC).filter(EVC.id == evc_id).first()


def get_evc_by_name(db_session: Session, name: str) -> EVC:
    return db_session.query(EVC).filter(EVC.name == name).first()
