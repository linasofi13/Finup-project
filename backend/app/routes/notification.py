# routes/notification.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.notification_service import create_notification, get_unread_notifications
from app.schemas.notification import NotificationCreate, NotificationOut
from app.database import get_db
from app.models.notification import Notification


router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationOut])
def list_unread_notifications(db: Session = Depends(get_db)):
    return get_unread_notifications(db)

@router.post("/", response_model=NotificationOut)
def send_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    return create_notification(db, payload)

@router.patch("/{notification_id}/read")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter_by(id=notification_id).first()
    if notif:
        notif.read = True
        db.commit()
        db.refresh(notif)
        return {"message": "Notificación marcada como leída"}
    return {"error": "Notificación no encontrada"}
