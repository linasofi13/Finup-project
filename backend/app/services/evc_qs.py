from sqlalchemy.orm import Session

from app.models.evc_q import EVC_Q
from app.schemas.evc_q import EVC_QCreate, EVC_QUpdate


def create_evc_q(db: Session, evc_q_data: EVC_QCreate):
    db_evc_q = EVC_Q(**evc_q_data.dict())
    db.add(db_evc_q)
    db.commit()
    db.refresh(db_evc_q)
    return db_evc_q


def get_evc_q_by_id(db: Session, evc_q_id: int):
    return db.query(EVC_Q).filter(EVC_Q.id == evc_q_id).first()


def get_evc_qs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EVC_Q).offset(skip).limit(limit).all()


def update_evc_q(db: Session, evc_q_id: int, evc_q_data: EVC_QUpdate):
    db_evc_q = get_evc_q_by_id(db, evc_q_id)
    if db_evc_q:
        for key, value in evc_q_data.dict(exclude_unset=True).items():
            setattr(db_evc_q, key, value)
        db.commit()
        db.refresh(db_evc_q)
    return db_evc_q


def delete_evc_q(db: Session, evc_q_id: int):
    db_evc_q = get_evc_q_by_id(db, evc_q_id)
    if db_evc_q:
        db.delete(db_evc_q)
        db.commit()
    return db_evc_q


