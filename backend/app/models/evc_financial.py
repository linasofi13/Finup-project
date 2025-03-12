from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, func, Float, Double
from sqlalchemy.orm import relationship
from app.database import Base


class EVC_Financial(Base):
    __tablename__ = "evc_financial"
    
    id=Column(Integer, primary_key=True, index=True)
    
    evc_q_id=Column(Integer, ForeignKey("evc_q.id"))
    role_provider_id=Column(Integer, ForeignKey("role_provider.id"))
    #Relationship with EVC_Q
    evc_q=relationship("EVC_Q", back_populates="evc_financials")
    role_provider=relationship("RoleProvider", back_populates="evc_financials")
    
    