from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class TechnicalLeader(Base):
    __tablename__ = "technical_leader"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    email = Column(String(80), nullable=False)
    entry_date = Column(DateTime, nullable=False, default=func.now())
    # Relationships
    evcs = relationship("EVC", back_populates="technical_leader")
    entornos = relationship("Entorno", back_populates="technical_leader")
