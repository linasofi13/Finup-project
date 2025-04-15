from sqlalchemy.orm import Session
from app.models.technical_leader import TechnicalLeader
from app.schemas.technical_leader import TechnicalLeaderCreate

def create_technical_leader(db: Session, technical_leader_data: TechnicalLeaderCreate):
  db_technical_leader= TechnicalLeader(**technical_leader_data.dict())
  db.add(db_technical_leader)
  db.commit()
  db.refresh(db_technical_leader)
  return db_technical_leader

def get_technical_leader(db: Session, technical_leader_id: int):
  return db.query(TechnicalLeader).filter(TechnicalLeader.id == technical_leader_id).first()

def get_technical_leaders(db: Session, skip: int = 0, limit: int = 100):
  return db.query(TechnicalLeader).offset(skip).limit(limit).all()