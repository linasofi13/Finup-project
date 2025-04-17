# app/models/evc.py
from sqlalchemy import Column, Integer, String, Float, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class EVC(Base):
    __tablename__ = "evc"  # Mantenemos solo un tablename

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    description = Column(String, nullable=True)
    creation_date = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(
        DateTime, nullable=False, default=func.now(), onupdate=func.now()
    )

    technical_leader_id = Column(Integer, ForeignKey("technical_leader.id"), nullable=True)
    functional_leader_id = Column(Integer, ForeignKey("functional_leader.id"), nullable=True)
    entorno_id = Column(Integer, ForeignKey("entorno.id"), nullable=True)
    status=Column(Boolean, default=True)

    # Relationships
    technical_leader = relationship("TechnicalLeader", back_populates="evcs")
    functional_leader = relationship("FunctionalLeader", back_populates="evcs")
    entorno = relationship("Entorno", back_populates="evcs")
    evc_qs = relationship("EVC_Q", back_populates="evc")
    # La relación con providers se maneja a través del backref en EVCProvider
