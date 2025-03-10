from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # Provider's name
    role = Column(String)  # Role (e.g., Data Engineer, DevOps, etc.)
    company = Column(String)  # Company providing the service
    country = Column(String)  # Country of origin
    cost_usd = Column(Float)  # Cost in USD
    category = Column(String)  # Provider's category
    line = Column(String)  # Technical or professional line
    email = Column(String, unique=True, index=True)  # Email address
