from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class EVC(Base):
    __tablename__ = "evc"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    project = Column(String(60), nullable=False)
    creation_date = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    technical_leader_id = Column(Integer, ForeignKey("technical_leader.id"))
    functional_leader_id = Column(Integer, ForeignKey("functional_leader.id"))
    entorno_id = Column(Integer, ForeignKey("entorno.id"))

    # Relationships
    technical_leader = relationship("TechnicalLeader", back_populates="evcs")
    functional_leader = relationship("FunctionalLeader", back_populates="evcs")
    entorno = relationship("Entorno", back_populates="evcs")
    evc_qs = relationship("EVC_Q", back_populates="evc")