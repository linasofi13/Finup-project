from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Document(Base):
    __tablename__ = "document"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=True)  # For storing file extension/type
    uploaded_at = Column(DateTime, default=datetime.utcnow) 