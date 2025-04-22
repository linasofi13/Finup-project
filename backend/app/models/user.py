from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "app_user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(60), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    # is_admin= Column(Boolean, nullable=True, default=False)
    # is_active = Column(Boolean, nullable=True, default=True)
    password = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="consultor")

    # Relationship to user-category
    categories = relationship("UserCategory", back_populates="user")
