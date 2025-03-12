from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, func, Float, Double
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ = "role"
    
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String(80), nullable=False)
    category_role_id=Column(Integer, ForeignKey("category_role.id"))
    #Relationship with CategoryRole
    category_role=relationship("CategoryRole", back_populates="roles")
    
    #Relationship with RoleProvider
    role_providers=relationship("RoleProvider", back_populates="role")