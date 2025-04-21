from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Provider(Base):
    __tablename__ = "provider"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    role = Column(String)
    company = Column(String)
    country = Column(String)
    cost_usd = Column(Float)
    category = Column(String)
    line = Column(String)
    email = Column(String, unique=True, index=True)
    
    # Relationships
    evc_financials = relationship("EVC_Financial", back_populates="provider")

    # Relationship with EVCProvider
    # evc_providers = relationship("EVCProvider", back_populates="provider")