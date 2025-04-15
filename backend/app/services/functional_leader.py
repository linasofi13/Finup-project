from sqlalchemy.orm import Session
from app.models.functional_leader import FunctionalLeader
from app.schemas.functional_leader import FunctionalLeaderCreate


def create_functional_leader(db: Session, functional_leader_date: FunctionalLeaderCreate):
  db_functional_leader = FunctionalLeader(**functional_leader_date.dict())
  db.add(db_functional_leader)
  db.commit()
  db.refresh(db_functional_leader)
  return db_functional_leader

def get_functional_leader(db: Session, functional_leader_id: int):
  return db.query(FunctionalLeader).filter(FunctionalLeader.id == functional_leader_id).first()
def get_functional_leaders(db: Session, skip: int = 0, limit: int = 100):
  return db.query(FunctionalLeader).offset(skip).limit(limit).all()

  
  