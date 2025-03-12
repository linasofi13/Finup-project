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


class CategoryRole(Base):
    __tablename__ = "category_role"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    # Relationship with Role
    roles = relationship("Role", back_populates="category_role")
