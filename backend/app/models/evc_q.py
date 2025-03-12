from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class EVC_Q(Base):
    __tablename__ = "evc_q"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    q = Column(Integer, nullable=False)
    evc_id = Column(Integer, ForeignKey("evc.id"))

    # Relationship with EVC
    evc = relationship("EVC", back_populates="evc_qs")
