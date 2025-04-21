from sqlalchemy.orm import Session
from app.models.functional_leader import FunctionalLeader
from app.schemas.functional_leader import FunctionalLeaderCreate, FunctionalLeaderUpdate


def create_functional_leader(
    db: Session, functional_leader_data: FunctionalLeaderCreate
):
    db_functional_leader = FunctionalLeader(**functional_leader_data.dict())
    db.add(db_functional_leader)
    db.commit()
    db.refresh(db_functional_leader)
    return db_functional_leader


def get_functional_leader(db: Session, functional_leader_id: int):
    return (
        db.query(FunctionalLeader)
        .filter(FunctionalLeader.id == functional_leader_id)
        .first()
    )


def get_functional_leaders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(FunctionalLeader).offset(skip).limit(limit).all()


def update_functional_leader(
    db: Session,
    functional_leader_id: int,
    functional_leader_data: FunctionalLeaderUpdate,
):
    db_functional_leader = get_functional_leader(db, functional_leader_id)
    if not db_functional_leader:
        return None
    for key, value in functional_leader_data.dict(exclude_unset=True).items():
        setattr(db_functional_leader, key, value)
    db.commit()
    db.refresh(db_functional_leader)
    return db_functional_leader


def delete_functional_leader(db: Session, functional_leader_id: int):
    db_functional_leader = get_functional_leader(db, functional_leader_id)
    if not db_functional_leader:
        return None
    db.delete(db_functional_leader)
    db.commit()
    return db_functional_leader
