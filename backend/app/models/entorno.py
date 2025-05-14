from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Entorno(Base):
    __tablename__ = "entorno"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    status = Column(Boolean, default=True)
    creation_date = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(
        DateTime, nullable=False, default=func.now(), onupdate=func.now()
    )

    technical_leader_id = Column(Integer, ForeignKey("technical_leader.id"))
    functional_leader_id = Column(Integer, ForeignKey("functional_leader.id"))

    # Relationships
    technical_leader = relationship("TechnicalLeader", back_populates="entornos")
    functional_leader = relationship("FunctionalLeader", back_populates="entornos")
    evcs = relationship("EVC", back_populates="entorno")
    budget_pockets = relationship("BudgetPocket", back_populates="entorno")
