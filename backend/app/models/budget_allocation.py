from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base


class BudgetAllocation(Base):
    __tablename__ = "budget_allocation"

    id = Column(Integer, primary_key=True, index=True)
    budget_pocket_id = Column(Integer, ForeignKey("budget_pocket.id"), nullable=False)
    evc_id = Column(Integer, ForeignKey("evc.id"), nullable=False)
    allocation_date = Column(DateTime, nullable=False, default=func.now())
    allocated_value = Column(Float, nullable=False)  # Valor asignado
    is_total_allocation = Column(Boolean, default=False)  # Indica si es una asignación total
    comments = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    # Relationships
    budget_pocket = relationship("BudgetPocket", back_populates="allocations")
    evc = relationship("EVC", back_populates="budget_allocations") 