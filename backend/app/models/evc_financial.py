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


class EVC_Financial(Base):
    __tablename__ = "evc_financial"

    id = Column(Integer, primary_key=True, index=True)

    evc_q_id = Column(Integer, ForeignKey("evc_q.id"))
    provider_id = Column(Integer, ForeignKey("provider.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    concept=Column(String(100), nullable=True)
    value_usd=Column(Float, nullable=True)
    # Relationship with EVC_Q
    evc_q = relationship("EVC_Q", back_populates="evc_financials")
    provider = relationship("Provider", back_populates="evc_financials")
