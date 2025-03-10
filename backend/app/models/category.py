from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .app_user_category import AppUserCategory
from app.database import Base


class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(45), nullable=False)

    # Relationship to user-category
    app_users = relationship("AppUserCategory", back_populates="category")
