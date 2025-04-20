from sqlalchemy.orm import Session
from app.models.technical_leader import TechnicalLeader
from app.schemas.technical_leader import TechnicalLeaderCreate, TechnicalLeaderUpdate


def create_technical_leader(db: Session, technical_leader_data: TechnicalLeaderCreate):
    db_technical_leader = TechnicalLeader(**technical_leader_data.dict())
    db.add(db_technical_leader)
    db.commit()
    db.refresh(db_technical_leader)
    return db_technical_leader


def get_technical_leader_by_id(db: Session, technical_leader_id: int):
    return (
        db.query(TechnicalLeader)
        .filter(TechnicalLeader.id == technical_leader_id)
        .first()
    )


def get_technical_leaders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TechnicalLeader).offset(skip).limit(limit).all()


def update_technical_leader(
    db: Session, technical_leader_id: int, technical_leader_data: TechnicalLeaderUpdate
):
    db_technical_leader = get_technical_leader_by_id(db, technical_leader_id)
    if db_technical_leader:
        for key, value in technical_leader_data.dict(exclude_unset=True).items():
            setattr(db_technical_leader, key, value)
        db.commit()
        db.refresh(db_technical_leader)
    return db_technical_leader


def delete_technical_leader(db: Session, technical_leader_id: int):
    db_technical_leader = get_technical_leader_by_id(db, technical_leader_id)
    if db_technical_leader:
        db.delete(db_technical_leader)
        db.commit()
    return db_technical_leader
