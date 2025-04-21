from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class CategoryLine(Base):
    __tablename__ = "category_line"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    
    providers = relationship("Provider", back_populates="category_line")
