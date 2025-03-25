from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class AppUserCategory(Base):
    __tablename__ = "app_user_category"

    id = Column(Integer, primary_key=True, index=True)
    app_user_id = Column(Integer, ForeignKey("app_user.id"))
    category_id = Column(Integer, ForeignKey("category.id"))

    app_user = relationship("AppUser", back_populates="categories")
    category = relationship("Category", back_populates="app_users")
