# app/services/evc_service.py

from sqlalchemy.orm import Session, joinedload
from app.models.evc import EVC
from app.models.provider import Provider
from app.models.evc_q import EVC_Q
from app.schemas.evc import EVCCreate, EVCUpdate, EVCResponse
from app.services.rule_evaluator import evaluate_rules
from app.models.evc_financial import EVC_Financial


def create_evc(db: Session, evc_data: EVCCreate):
    db_evc = EVC(**evc_data.dict())
    db.add(db_evc)
    db.commit()
    db.refresh(db_evc)
    evaluate_rules(db, changed_table="evc", changed_id=db_evc.id)
    return db_evc


def get_evcs(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(EVC)
        .options(
            joinedload(EVC.entorno),
            joinedload(EVC.technical_leader),
            joinedload(EVC.functional_leader),
            joinedload(EVC.evc_qs),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_evc_by_id(db: Session, evc_id: int):
    return db.query(EVC).filter(EVC.id == evc_id).first()


def update_evc(db: Session, evc_id: int, evc_data: EVCUpdate):
    db_evc = get_evc_by_id(db, evc_id)
    if db_evc:
        for key, value in evc_data.dict(exclude_unset=True).items():
            setattr(db_evc, key, value)
        db.commit()
        db.refresh(db_evc)
        evaluate_rules(db, changed_table="evc", changed_id=db_evc.id)
    return db_evc


def delete_evc(db: Session, evc_id: int):
    try:
        # First, find all quarters for this EVC
        quarters = db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).all()
        quarter_ids = [q.id for q in quarters]
        if quarter_ids:
            # Delete all EVC_Financial records for these quarters
            db.query(EVC_Financial).filter(EVC_Financial.evc_q_id.in_(quarter_ids)).delete(synchronize_session=False)
        # Now delete the quarters
        db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).delete(synchronize_session=False)
        db_evc = get_evc_by_id(db, evc_id)
        if db_evc:
            db.delete(db_evc)
            db.commit()
        return db_evc
    except Exception as e:
        db.rollback()
        print(f"Error deleting EVC: {str(e)}")
        raise
