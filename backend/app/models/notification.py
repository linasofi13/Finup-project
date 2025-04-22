# models/notification.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notification"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    type = Column(String, default="alert")  # info | warning | alert
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
