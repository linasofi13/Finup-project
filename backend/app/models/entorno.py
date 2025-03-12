from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Boolean,
    Date,
    func,
    DateTime,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Entorno(Base):
    __tablename__ = "entorno"  # Define the table name

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    status = Column(Boolean, default=False, nullable=False)
    creation_date = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(
        DateTime, nullable=False, default=func.now(), onupdate=func.current_date()
    )

    functional_leader_id = Column(Integer, ForeignKey("functional_leader.id"))
    technical_leader_id = Column(Integer, ForeignKey("technical_leader.id"))

    # functional and technical leader relationships
    functional_leader = relationship("FunctionalLeader", back_populates="entornos")
    technical_leader = relationship("TechnicalLeader", back_populates="entornos")

    # EVC relationship
    evcs = relationship("EVC", back_populates="entorno")
