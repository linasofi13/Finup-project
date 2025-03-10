from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base



class AppUserCategory(Base):
    __tablename__ = "app_user_category"
    
    app_user_category_id = Column(Integer, primary_key=True, index=True)
    app_user_id = Column(Integer, ForeignKey("app_user.app_user_id"))
    category_id = Column(Integer, ForeignKey("category.category_id"))

    app_user = relationship("AppUser", back_populates="categories")
    category = relationship("Category", back_populates="app_users")