# models/notification_rule.py
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from datetime import datetime
from app.database import Base


class NotificationRule(Base):
    __tablename__ = "notification_rule"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_table = Column(String, nullable=False)
    condition_field = Column(String, nullable=False)
    threshold = Column(Float, nullable=False)
    comparison = Column(String, nullable=False)  # e.g., ">", "<=", "=="
    message = Column(String, nullable=False)
    type = Column(String, default="alert")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
