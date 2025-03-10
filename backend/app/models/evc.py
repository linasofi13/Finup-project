from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class EVC(Base):
    __tablename__ = "evcs"  # Define the table name

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Example field
    description = Column(String)  # Example field