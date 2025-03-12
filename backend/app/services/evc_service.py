from sqlalchemy.orm import Session
from app.models.evc import EVC
from app.schemas.evc import EVCCreate


def create_evc(db: Session, evc_data: EVCCreate):
    """Create a new EVC."""
    evc = EVC(**evc_data.dict())
    db.add(evc)
    db.commit()
    db.refresh(evc)
    return evc


def get_evcs(db: Session):
    """Retrieve all EVCs."""
    return db.query(EVC).all()


def get_evc(db: Session, evc_id: int):
    """Retrieve a specific EVC by ID."""
    return db.query(EVC).filter(EVC.id == evc_id).first()


def delete_evc(db: Session, evc_id: int):
    """Delete an EVC by ID."""
    evc = db.query(EVC).filter(EVC.id == evc_id).first()
    if evc:
        db.delete(evc)
        db.commit()
    return evc
