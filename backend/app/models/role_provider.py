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


class RoleProvider(Base):
    __tablename__ = "role_provider"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("role.id"))
    last_update = Column(DateTime, default=func.now(), onupdate=func.now())
    price_usd = Column(Float, nullable=False)

    provider_id = Column(Integer, ForeignKey("providers.id"))
    country_id = Column(Integer, ForeignKey("country.id"))

    # Relationship with Provider, Country, Role
    provider = relationship("Provider", back_populates="role_providers")
    country = relationship("Country", back_populates="role_providers")
    role = relationship("Role", back_populates="role_providers")

    # Relationship with EVC_Financial
    evc_financials = relationship("EVC_Financial", back_populates="role_provider")
