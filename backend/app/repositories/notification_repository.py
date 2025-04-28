# app/repositories/notification_repository.py
from app.models.notification import Notification
from sqlalchemy.orm import Session


def create_notification(db: Session, data: dict):
    notification = Notification(**data)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
