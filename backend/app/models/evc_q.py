from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Date,
    func,
    Float,
    Double,
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.evc_financial import EVC_Financial

class EVC_Q(Base):
    __tablename__ = "evc_q"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    q = Column(Integer, nullable=False)
    allocated_budget = Column(Float, nullable=False)
    allocated_budget = Column(Float, nullable=False)

    evc_id = Column(Integer, ForeignKey("evc.id"))

    evc = relationship("EVC", back_populates="evc_qs")
    # Relationship with evc_financial
    evc_financials = relationship("EVC_Financial", back_populates="evc_q")