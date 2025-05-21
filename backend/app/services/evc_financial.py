from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.evc_financial import EVC_Financial
from app.schemas.evc_financial import (
    EVC_FinancialCreate,
    EVC_FinancialUpdate,
    EVC_FinancialCreateConcept,
)
from app.models.provider import Provider
from app.models.evc_q import EVC_Q
from app.services.rule_evaluator import evaluate_rules
from app.database import SessionLocal
from sqlalchemy.sql import text


def create_evc_financial(db: Session, evc_financial_data: EVC_FinancialCreate):
    db_evc_financial = EVC_Financial(**evc_financial_data.dict())
    db.add(db_evc_financial)
    db.commit()
    db.refresh(db_evc_financial)

    # Store financial_id and evc_q_id for rule evaluation
    financial_id = db_evc_financial.id
    evc_q_id = db_evc_financial.evc_q_id

    # Use a separate session for rule evaluation
    try:
        eval_db = SessionLocal()
        try:
            evaluate_rules(
                eval_db, changed_table="evc_financial", changed_id=financial_id
            )
            if evc_q_id:
                evaluate_rules(eval_db, changed_table="evc_q", changed_id=evc_q_id)
        finally:
            eval_db.close()
    except Exception as e:
        print(f"Error evaluating rules after creating financial: {e}")

    return db_evc_financial


def create_evc_financial_concept(
    db: Session, evc_financial_data: EVC_FinancialCreateConcept
):
    db_evc_financial = EVC_Financial(**evc_financial_data.model_dump())
    db.add(db_evc_financial)
    db.commit()
    db.refresh(db_evc_financial)

    # Store the ID and evc_q_id for rule evaluation
    financial_id = db_evc_financial.id
    evc_q_id = db_evc_financial.evc_q_id

    # Add rule evaluation to trigger budget usage notifications
    # Use a separate try/except block to avoid transaction conflicts
    try:
        # Create a new session for rule evaluation to avoid transaction conflicts
        eval_db = SessionLocal()
        try:
            # First evaluate financial rules
            evaluate_rules(
                eval_db, changed_table="evc_financial", changed_id=financial_id
            )

            # Then evaluate EVC_Q rules since budget usage notifications are tied to quarters
            if evc_q_id:
                evaluate_rules(eval_db, changed_table="evc_q", changed_id=evc_q_id)
        finally:
            eval_db.close()
    except Exception as e:
        print(f"Error evaluating rules after creating financial concept: {e}")
        # Don't fail the transaction if rule evaluation fails

    return db_evc_financial


def get_evc_financial_by_id(db: Session, evc_financial_id: int):
    return db.query(EVC_Financial).filter(EVC_Financial.id == evc_financial_id).first()


def get_evc_financials(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EVC_Financial).offset(skip).limit(limit).all()


def update_evc_financial(
    db: Session, evc_financial_id: int, evc_financial_data: EVC_FinancialUpdate
):
    db_evc_financial = get_evc_financial_by_id(db, evc_financial_id)
    if db_evc_financial:
        # Store evc_q_id before update
        evc_q_id = db_evc_financial.evc_q_id

        for key, value in evc_financial_data.dict(exclude_unset=True).items():
            setattr(db_evc_financial, key, value)
        db.commit()
        db.refresh(db_evc_financial)

        # Use a separate session for rule evaluation
        try:
            eval_db = SessionLocal()
            try:
                evaluate_rules(
                    eval_db, changed_table="evc_financial", changed_id=evc_financial_id
                )
                if evc_q_id:
                    evaluate_rules(eval_db, changed_table="evc_q", changed_id=evc_q_id)
            finally:
                eval_db.close()
        except Exception as e:
            print(f"Error evaluating rules after updating financial: {e}")
    return db_evc_financial


def delete_evc_financial(db: Session, evc_financial_id: int):
    db_evc_financial = get_evc_financial_by_id(db, evc_financial_id)
    if db_evc_financial:
        # Store evc_q_id before deletion
        evc_q_id = db_evc_financial.evc_q_id

        db.delete(db_evc_financial)
        db.commit()

        # Use a separate session for rule evaluation
        try:
            eval_db = SessionLocal()
            try:
                evaluate_rules(
                    eval_db, changed_table="evc_financial", changed_id=evc_financial_id
                )
                if evc_q_id:
                    evaluate_rules(eval_db, changed_table="evc_q", changed_id=evc_q_id)
            finally:
                eval_db.close()
        except Exception as e:
            print(f"Error evaluating rules after deleting financial: {e}")
    return db_evc_financial


def get_spendings_by_evc_q(db: Session, evc_q_id: int) -> float:
    total = (
        db.query(func.sum(Provider.cost_usd))
        .join(EVC_Financial, EVC_Financial.provider_id == Provider.id)
        .filter(EVC_Financial.evc_q_id == evc_q_id)
        .scalar()
    )
    total2 = (
        db.query(func.sum(EVC_Financial.value_usd))
        .filter(EVC_Financial.evc_q_id == evc_q_id)
        .scalar()
    )
    if total is None:
        total = 0.0
    if total2 is None:
        total2 = 0.0

    return total + total2 or 0.0


def get_providers_by_evc_q(db: Session, evc_q_id: int):
    providers = (
        db.query(Provider)
        .join(EVC_Financial, EVC_Financial.provider_id == Provider.id)
        .filter(EVC_Financial.evc_q_id == evc_q_id)
        .all()
    )
    return providers


def get_percentage_by_evc_q(db: Session, evc_q_id: int) -> float:
    total_spendings = get_spendings_by_evc_q(db, evc_q_id)
    total_budget = (
        db.query(EVC_Q.allocated_budget).filter(EVC_Q.id == evc_q_id).scalar()
    )
    percentage = (total_spendings / total_budget) if total_budget else 0.0
    return percentage
