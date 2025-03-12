from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, func, Float, Double
from sqlalchemy.orm import relationship
from app.database import Base


class Provider(Base):
    __tablename__ = "providers"
    
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(60), nullable=False)
    category_role_id=Column(Integer, ForeignKey("category_role.id"))
    #Relationship with CategoryProvider
    category_provider=relationship("CategoryProvider", back_populates="providers")
    #Relationship with RoleProvider
    role_providers=relationship("RoleProvider", back_populates="provider")