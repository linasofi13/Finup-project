# app/services/evc_service.py
from sqlalchemy.orm import Session
from app.models.evc import EVC
from app.models.evc_provider import EVCProvider
from app.schemas.evc import EVCCreate


def create_evc(db: Session, evc_data: EVCCreate):
    """Create a new EVC and assign providers via the EVCProvider table."""
    # 1. Crear la EVC con los campos principales
    evc = EVC(
        name=evc_data.name,
        project=evc_data.project,
        environment=evc_data.environment,
        q1_budget=evc_data.q1_budget,
        q2_budget=evc_data.q2_budget,
        q3_budget=evc_data.q3_budget,
        q4_budget=evc_data.q4_budget,
        description=evc_data.description,
    )
    db.add(evc)
    db.commit()
    db.refresh(evc)

    # 2. Asignar proveedores (uno por cada rol que el usuario haya indicado)
    for provider_info in evc_data.providers:
        association = EVCProvider(
            evc_id=evc.id,
            provider_id=provider_info.provider_id,
            role_name=provider_info.role_name,
        )
        db.add(association)

    db.commit()
    db.refresh(evc)
    return evc


def get_evcs(db: Session):
    return db.query(EVC).all()


def get_evc(db: Session, evc_id: int):
    return db.query(EVC).filter(EVC.id == evc_id).first()


def delete_evc(db: Session, evc_id: int):
    evc = db.query(EVC).filter(EVC.id == evc_id).first()
    if evc:
        db.delete(evc)
        db.commit()
    return evc
