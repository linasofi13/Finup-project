from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, func, Float, Double
from sqlalchemy.orm import relationship
from app.database import Base

class Country(Base):
    __tablename__ = "country"
    
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(50), nullable=False)
    
    #Relationship with RoleProvider
    role_providers=relationship("RoleProvider", back_populates="country")