from sqlalchemy.orm import Session
from sqlalchemy import func, select, create_engine
from app.models.evc_financial import EVC_Financial
from app.schemas.evc_financial import EVC_FinancialCreate, EVC_FinancialUpdate, EVC_FinancialCreateConcept
from app.models.provider import Provider
from app.models.evc_q import EVC_Q


def create_evc_financial(db: Session, evc_financial_data: EVC_FinancialCreate):
    db_evc_financial = EVC_Financial(**evc_financial_data.dict())
    db.add(db_evc_financial)
    db.commit()
    db.refresh(db_evc_financial)
    return db_evc_financial


def create_evc_financial_concept(
    db: Session, evc_financial_data: EVC_FinancialCreateConcept
):
    db_evc_financial = EVC_Financial(**evc_financial_data.model_dump())
    db.add(db_evc_financial)
    db.commit()
    db.refresh(db_evc_financial)
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
        for key, value in evc_financial_data.dict(exclude_unset=True).items():
            setattr(db_evc_financial, key, value)
        db.commit()
        db.refresh(db_evc_financial)
    return db_evc_financial


def delete_evc_financial(db: Session, evc_financial_id: int):
    db_evc_financial = get_evc_financial_by_id(db, evc_financial_id)
    if db_evc_financial:
        db.delete(db_evc_financial)
        db.commit()
    return db_evc_financial


def get_spendings_by_evc_q(db: Session, evc_q_id: int) -> float:
    """
    Get the total spendings (sum of RoleProvider.price_usd) for a given evc_q_id.
    """
    total = db.query(func.sum(Provider.cost_usd)).join(
        EVC_Financial, EVC_Financial.provider_id == Provider.id
    ).filter(
        EVC_Financial.evc_q_id == evc_q_id
    ).scalar()
    total2= db.query(func.sum(EVC_Financial.value_usd)).filter(
        EVC_Financial.evc_q_id == evc_q_id
    ).scalar()
    if total is None:
        total = 0.0
    if total2 is None:
        total2 = 0.0

    return total+total2 or 0.0

def get_percentage_by_evc_q(db: Session, evc_q_id: int) -> float:
    """
    Get the percentage of spendings for a given evc_q_id.
    """
    total_spendings = get_spendings_by_evc_q(db, evc_q_id)
    total_budget= db.query(EVC_Q.allocated_budget).filter(EVC_Q.id == evc_q_id).scalar()
    percentage= (total_spendings / total_budget) if total_budget else 0.0
    return percentage
    