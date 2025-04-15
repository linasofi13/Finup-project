# app/services/evc_service.py
from sqlalchemy.orm import Session
from app.models.evc import EVC
from app.models.provider import Provider
from app.schemas.evc import EVCCreate


def create_evc(db: Session, evc_data: EVCCreate):
    evc= EVC(**evc_data.dict())
    db.add(evc)
    db.commit()
    db.refresh(evc)
    return evc


def get_evcs(db: Session):
    return db.query(EVC).all()


def get_evc(db: Session, evc_id: int):
    return db.query(EVC).filter(EVC.id == evc_id).first()


def delete_evc(db: Session, evc_id: int):
    evc = db.query(EVC).filter(EVC.id == evc_id).first()
    if evc:
        db.delete(evc)
        db.commit()
    return evc
