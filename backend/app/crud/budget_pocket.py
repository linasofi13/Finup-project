from sqlalchemy.orm import Session, joinedload
from app.models.budget_pocket import BudgetPocket
from app.schemas.budget_pocket import BudgetPocketCreate, BudgetPocketUpdate
from app.models.entorno import Entorno
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


def get_budget_pocket(db: Session, budget_pocket_id: int) -> Optional[BudgetPocket]:
    return db.query(BudgetPocket).filter(BudgetPocket.id == budget_pocket_id).first()


def get_budget_pockets(db: Session, skip: int = 0, limit: int = 100) -> List[BudgetPocket]:
    return db.query(BudgetPocket).offset(skip).limit(limit).all()


def get_budget_pocket(db: Session, budget_pocket_id: int):
    return (
        db.query(BudgetPocket)
        .options(joinedload(BudgetPocket.entorno))
        .filter(BudgetPocket.id == budget_pocket_id)
        .first()
    )


def get_budget_pockets(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(BudgetPocket)
        .options(joinedload(BudgetPocket.entorno))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_budget_pockets_by_entorno(db: Session, entorno_id: int):
    return (
        db.query(BudgetPocket)
        .options(joinedload(BudgetPocket.entorno))
        .filter(BudgetPocket.entorno_id == entorno_id)
        .all()
    )


def get_budget_pockets_by_year(db: Session, year: int):
    return (
        db.query(BudgetPocket)
        .options(joinedload(BudgetPocket.entorno))
        .filter(BudgetPocket.year == year)
        .all()
    )


def create_budget_pocket(db: Session, budget_pocket: BudgetPocketCreate):
    # Verify entorno exists
    entorno = db.query(Entorno).filter(Entorno.id == budget_pocket.entorno_id).first()
    if not entorno:
        raise ValueError(f"Entorno with id {budget_pocket.entorno_id} does not exist")

    db_budget_pocket = BudgetPocket(**budget_pocket.model_dump())
    db.add(db_budget_pocket)
    db.commit()
    db.refresh(db_budget_pocket)
    # Reload with relationships
    return get_budget_pocket(db, db_budget_pocket.id)


def update_budget_pocket(
    db: Session, budget_pocket_id: int, budget_pocket: BudgetPocketUpdate
):
    db_budget_pocket = get_budget_pocket(db, budget_pocket_id)
    if db_budget_pocket:
        update_data = budget_pocket.model_dump(exclude_unset=True)
        
        # If entorno_id is being updated, verify it exists
        if 'entorno_id' in update_data:
            entorno = db.query(Entorno).filter(Entorno.id == update_data['entorno_id']).first()
            if not entorno:
                raise ValueError(f"Entorno with id {update_data['entorno_id']} does not exist")

        for key, value in update_data.items():
            setattr(db_budget_pocket, key, value)
        db.commit()
        db.refresh(db_budget_pocket)
        return db_budget_pocket
    return None


def delete_budget_pocket(db: Session, budget_pocket_id: int):
    db_budget_pocket = get_budget_pocket(db, budget_pocket_id)
    if db_budget_pocket:
        db.delete(db_budget_pocket)
        db.commit()
        return True
    return False 