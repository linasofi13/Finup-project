# app/models/evc_provider.py
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class EVCProvider(Base):
    __tablename__ = "evc_providers"

    id = Column(Integer, primary_key=True, index=True)
    evc_id = Column(Integer, ForeignKey("evcs.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    role_name = Column(String, nullable=True) 

    # Relaciones
    evc = relationship("EVC", back_populates="evc_providers")
    provider = relationship("Provider", back_populates="evc_providers")
