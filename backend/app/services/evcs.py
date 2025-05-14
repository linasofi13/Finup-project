# app/services/evc_service.py

from sqlalchemy.orm import Session, joinedload
from app.models.evc import EVC
from app.models.provider import Provider
from app.models.evc_q import EVC_Q
from app.schemas.evc import EVCCreate, EVCUpdate, EVCResponse
from app.services.rule_evaluator import evaluate_rules
from app.models.evc_financial import EVC_Financial
from app.models.budget_allocation import BudgetAllocation
from sqlalchemy import func


def create_evc(db: Session, evc_data: EVCCreate):
    db_evc = EVC(**evc_data.dict())
    db.add(db_evc)
    db.commit()
    db.refresh(db_evc)
    evaluate_rules(db, changed_table="evc", changed_id=db_evc.id)
    return db_evc


def get_evcs(db: Session, skip: int = 0, limit: int = 100):
    evcs = (
        db.query(EVC)
        .options(
            joinedload(EVC.entorno),
            joinedload(EVC.technical_leader),
            joinedload(EVC.functional_leader),
            joinedload(EVC.evc_qs)
            .joinedload(EVC_Q.evc_financials)
            .joinedload(EVC_Financial.provider),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Calculate spending information for each EVC quarter
    for evc in evcs:
        for quarter in evc.evc_qs:
            # Calculate total spendings
            total_spendings = (
                db.query(func.sum(Provider.cost_usd))
                .join(EVC_Financial, EVC_Financial.provider_id == Provider.id)
                .filter(EVC_Financial.evc_q_id == quarter.id)
                .scalar()
                or 0.0
            )

            # Add manual spendings
            manual_spendings = (
                db.query(func.sum(EVC_Financial.value_usd))
                .filter(EVC_Financial.evc_q_id == quarter.id)
                .scalar()
                or 0.0
            )

            total_spendings += manual_spendings

            # Calculate percentage
            percentage = (
                (total_spendings / quarter.allocated_budget) * 100
                if quarter.allocated_budget
                else 0.0
            )

            # Add the calculated values to the quarter object
            quarter.total_spendings = total_spendings
            quarter.percentage = percentage

            # Add budget message
            if percentage >= 100:
                quarter.budget_message = "No hay más presupuesto"
            elif percentage >= 80:
                quarter.budget_message = "Ya casi te quedas sin presupuesto"
            elif percentage >= 50:
                quarter.budget_message = "Vas a la mitad del presupuesto"
            else:
                quarter.budget_message = "Presupuesto suficiente"

    return evcs


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
        # First, delete all budget allocations for this EVC
        db.query(BudgetAllocation).filter(BudgetAllocation.evc_id == evc_id).delete(
            synchronize_session=False
        )

        # Then find all quarters for this EVC
        quarters = db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).all()
        quarter_ids = [q.id for q in quarters]

        if quarter_ids:
            # Delete all EVC_Financial records for these quarters
            db.query(EVC_Financial).filter(
                EVC_Financial.evc_q_id.in_(quarter_ids)
            ).delete(synchronize_session=False)

        # Now delete the quarters
        db.query(EVC_Q).filter(EVC_Q.evc_id == evc_id).delete(synchronize_session=False)

        # Finally delete the EVC
        db_evc = get_evc_by_id(db, evc_id)
        if db_evc:
            db.delete(db_evc)
            db.commit()

        return db_evc
    except Exception as e:
        db.rollback()
        print(f"Error deleting EVC: {str(e)}")
        raise
