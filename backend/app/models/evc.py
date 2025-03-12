from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class EVC(Base):
    __tablename__ = "evc"  # Define the table name

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), index=True)  # Example field
    description = Column(Text)  # Example field
    status= Column(Boolean, default=False, nullable=False)
    creation_date=Column(DateTime, nullable=False, default=func.now())
    updated_at=Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    entorno_id = Column(Integer, ForeignKey("entorno.id"))
    functional_leader_id = Column(Integer, ForeignKey("functional_leader.id"))
    technical_leader_id = Column(Integer, ForeignKey("technical_leader.id"))
    
    #Relationship with evc_q
    
    # In the EVC class
    entorno = relationship("Entorno", back_populates="evcs")  # Add this line
    functional_leader = relationship("FunctionalLeader", back_populates="evcs")
    technical_leader= relationship("TechnicalLeader", back_populates="evcs")
    
    #Other relationships
    evc_qs = relationship("EVC_Q", back_populates="evc")