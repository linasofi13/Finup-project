from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class AppUser(Base):
    __tablename__ = "app_user"

    app_user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(60), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # Relationship to user-category
    categories = relationship("AppUserCategory", back_populates="app_user")
