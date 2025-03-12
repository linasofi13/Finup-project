from app.models import FunctionalLeader

from sqlalchemy.orm import Session


def create_functional_leader(db_session: Session, functional_leader: FunctionalLeader) -> FunctionalLeader:
    db_session.add(functional_leader)
    db_session.commit()
    db_session.refresh(functional_leader)
    return functional_leader
def get_functional_leader_by_id(db_session: Session, functional_leader_id: int) -> FunctionalLeader:
    return db_session.query(FunctionalLeader).filter(FunctionalLeader.id == functional_leader_id).first()

def get_functional_leader_by_name(db_session: Session, name: str) -> FunctionalLeader:
    return db_session.query(FunctionalLeader).filter(FunctionalLeader.name == name).first()

