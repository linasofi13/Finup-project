# app/models/evc.py
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class EVC(Base):
    __tablename__ = "evcs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    project = Column(String, nullable=True)
    environment = Column(String, nullable=True)
    q1_budget = Column(Float, default=0.0)
    q2_budget = Column(Float, default=0.0)
    q3_budget = Column(Float, default=0.0)
    q4_budget = Column(Float, default=0.0)
    description = Column(String, nullable=True)

    # Relación con la tabla intermedia
    evc_providers = relationship("EVCProvider", back_populates="evc")
