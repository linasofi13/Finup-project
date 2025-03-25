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


class CategoryProvider(Base):
    __tablename__ = "category_provider"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    # Relationship with Provider
    providers = relationship("Provider", back_populates="category_provider")
