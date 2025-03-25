rom sqlalchemy import Column, Integer, String
from app.database import Base

class TechnicalLeader(Base):
    __tablename__ = "technical_leaders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

class FunctionalLeader(Base):
    __tablename__ = "functional_leaders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)