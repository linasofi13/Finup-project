from sqlalchemy.orm import Session

from app.models.evc_financial import EVC_Financial
from app.schemas.evc_financial import EVC_FinancialCreate, EVC_FinancialUpdate

def create_evc_financial(db: Session, evc_financial_data: EVC_FinancialCreate):
    db_evc_financial = EVC_Financial(**evc_financial_data.dict())
    db.add(db_evc_financial)
    db.commit()
    db.refresh(db_evc_financial)
    return db_evc_financial

def get_evc_financial_by_id(db: Session, evc_financial_id: int):
    return db.query(EVC_Financial).filter(EVC_Financial.id == evc_financial_id).first()

def get_evc_financials(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EVC_Financial).offset(skip).limit(limit).all()

def update_evc_financial(db: Session, evc_financial_id: int, evc_financial_data: EVC_FinancialUpdate):
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
