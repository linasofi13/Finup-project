from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, Float
from sqlalchemy.orm import relationship
from app.database import Base


class EVC_Q(Base):
    __tablename__ = "evc_q"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    q = Column(Integer, nullable=False)
    evc_id = Column(Integer, ForeignKey("evc.id"))
    allocated_budget = Column(Float, nullable=True)
    allocated_percentage = Column(Float, nullable=True)
    
    # Relationship with EVC
    evc = relationship("EVC", back_populates="evc_qs")
    
     # Relationship with evc_financial
    evc_financials = relationship("EVC_Financial", back_populates="evc_q")
