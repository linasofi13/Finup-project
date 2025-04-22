# app/services/evc_service.py

from sqlalchemy.orm import Session, joinedload
from app.models.evc import EVC
from app.models.provider import Provider
from app.models.evc_q import EVC_Q
from app.schemas.evc import EVCCreate, EVCUpdate, EVCResponse


def create_evc(db: Session, evc_data: EVCCreate):
    db_evc = EVC(**evc_data.dict())
    db.add(db_evc)
    db.commit()
    db.refresh(db_evc)
    return db_evc


def get_evcs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EVC).options(
        joinedload(EVC.entorno),
        joinedload(EVC.technical_leader),
        joinedload(EVC.functional_leader),
        joinedload(EVC.evc_qs)
    ).offset(skip).limit(limit).all()


def get_evc_by_id(db: Session, evc_id: int):
    return db.query(EVC).filter(EVC.id == evc_id).first()


def update_evc(db: Session, evc_id: int, evc_data: EVCUpdate):
    db_evc = get_evc_by_id(db, evc_id)
    if db_evc:
        for key, value in evc_data.dict(exclude_unset=True).items():
            setattr(db_evc, key, value)
        db.commit()
        db.refresh(db_evc)
    return db_evc


def delete_evc(db: Session, evc_id: int):
    try:
        # Eliminar primero las relaciones con EVC_Q
        db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).delete()
        db_evc = get_evc_by_id(db, evc_id)
        if db_evc:
            db.delete(db_evc)
            db.commit()
        return db_evc
    except Exception as e:
        db.rollback()
        print(f"Error deleting EVC: {str(e)}")
        raise
