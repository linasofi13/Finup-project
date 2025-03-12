from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import relationship
from app.database import Base


class FunctionalLeader(Base):
    __tablename__ = "functional_leader"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    email = Column(String(80), nullable=False)
    entry_date = Column(DateTime, nullable=False, default=func.now())

    # Relationship with Entorno and EVC
    entornos = relationship("Entorno", back_populates="functional_leader")
    evcs = relationship("EVC", back_populates="functional_leader")
