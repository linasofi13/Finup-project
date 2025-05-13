from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base


class BudgetPocket(Base):
    __tablename__ = "budget_pocket"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    entorno_id = Column(Integer, ForeignKey("entorno.id"), nullable=False)
    agreed_value = Column(Float, nullable=False)  # Valor año acordado entorno
    status = Column(Boolean, default=True)  # Activa/Inactiva
    is_available = Column(Boolean, default=True)  # Disponible para asignación
    total_allocated = Column(Float, default=0.0)  # Total asignado
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    # Relationships
    entorno = relationship("Entorno", back_populates="budget_pockets")
    allocations = relationship("BudgetAllocation", back_populates="budget_pocket") 