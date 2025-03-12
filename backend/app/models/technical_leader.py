from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class TechnicalLeader(Base):
    __tablename__ = "technical_leader"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    
    # Relationships
    entornos = relationship("Entorno", back_populates="technical_leader")
    evcs = relationship("EVC", back_populates="technical_leader")