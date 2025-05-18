from sqlalchemy.orm import Session
from app.models.evc_q import EVC_Q
from app.schemas.evc_q import EVC_QCreate, EVC_QUpdate
from app.services.rule_evaluator import evaluate_rules
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException


def predict_next_exp_smoothing(data, alpha=0.5):
    if not data:
        return 0
    if len(data) == 1:
        return data[0]
    forecast = data[0]
    for value in data[1:]:
        forecast = alpha * value + (1 - alpha) * forecast
    return forecast


def suggest_next_q(q):
    if not q or q == 4:
        return 1
    return q + 1


def create_evc_q(db: Session, evc_q_data: EVC_QCreate):
    db_evc_q = EVC_Q(**evc_q_data.model_dump())
    db.add(db_evc_q)
    try:
        db.commit()
        db.refresh(db_evc_q)
        
        # Evaluate rules in a separate transaction to prevent cascading failures
        try:
            evaluate_rules(db, changed_table="evc_q", changed_id=db_evc_q.id)
        except SQLAlchemyError as e:
            print(f"Error in rule evaluation: {e}")
            # Log the error but don't fail the EVC_Q creation
        
        return db_evc_q
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Error creating EVC_Q")


def get_evc_q_by_id(db: Session, evc_q_id: int):
    return db.query(EVC_Q).filter(EVC_Q.id == evc_q_id).first()


def get_evc_qs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EVC_Q).offset(skip).limit(limit).all()


def get_evc_qs_by_evc_id(db: Session, evc_id: int):
    return db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).all()


def get_last_evc_q_by_evc_id(db: Session, evc_id: int):
    return (
        db.query(EVC_Q)
        .filter(EVC_Q.evc_id == evc_id)
        .order_by(EVC_Q.year.desc(), EVC_Q.q.desc())
        .first()
    )


def update_evc_q(db: Session, evc_q_id: int, evc_q_data: EVC_QUpdate):
    db_evc_q = get_evc_q_by_id(db, evc_q_id)
    if db_evc_q:
        for key, value in evc_q_data.dict(exclude_unset=True).items():
            setattr(db_evc_q, key, value)
        try:
            db.commit()
            db.refresh(db_evc_q)
            
            # Evaluate rules in a separate transaction to prevent cascading failures
            try:
                evaluate_rules(db, changed_table="evc_q", changed_id=db_evc_q.id)
            except SQLAlchemyError as e:
                print(f"Error in rule evaluation during update: {e}")
                # Log the error but don't fail the EVC_Q update
            
            return db_evc_q
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Database error during update: {e}")
            raise HTTPException(status_code=500, detail="Error updating EVC_Q")
    return db_evc_q


def delete_evc_q(db: Session, evc_q_id: int):
    db_evc_q = get_evc_q_by_id(db, evc_q_id)
    if db_evc_q:
        db.delete(db_evc_q)
        db.commit()
    return db_evc_q


def get_default_creation_values(db: Session, evc_id: int) -> dict:
    year = datetime.now().year
    evc_data = (
        db.query(
            EVC_Q.allocated_budget,
            EVC_Q.creation_date,
            EVC_Q.q,  # Add other fields you need
        )
        .filter(EVC_Q.evc_id == evc_id)
        .order_by(EVC_Q.creation_date.desc())
        .all()
    )
    evc_budget_values = []
    quarter = None
    if evc_data:
        last_instance = evc_data[0]
        evc_budget_values = [row.allocated_budget for row in evc_data]
        quarter = last_instance.q
    expected_value = predict_next_exp_smoothing(evc_budget_values)
    next_q = suggest_next_q(quarter)
    return {
        "year": year,
        "budget": expected_value,
        "quarter": next_q,
    }
