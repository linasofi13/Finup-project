from sqlalchemy.orm import Session
from app.models import TechnicalLeader


def create_technical_leader(
    db_session: Session, technical_leader: TechnicalLeader
) -> TechnicalLeader:
    db_session.add(technical_leader)
    db_session.commit()
    db_session.refresh(technical_leader)
    return technical_leader


def get_functional_leader_by_id(
    db_session: Session, technical_leader_id: int
) -> TechnicalLeader:
    return (
        db_session.query(TechnicalLeader)
        .filter(TechnicalLeader.id == technical_leader_id)
        .first()
    )


def get_functional_leader_by_name(db_session: Session, name: str) -> TechnicalLeader:
    return (
        db_session.query(TechnicalLeader).filter(TechnicalLeader.name == name).first()
    )
