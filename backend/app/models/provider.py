from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Provider(Base):
    __tablename__ = "provider"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    role = Column(String)
    company = Column(String)
    email = Column(String, unique=True, index=True)

    category_provider_id = Column(Integer, ForeignKey("category_provider.id"))

    # Relationship with category_provider
    category_provider = relationship("CategoryProvider", back_populates="providers")
    # Relationship with role_provider
    role_providers = relationship("RoleProvider", back_populates="provider")
