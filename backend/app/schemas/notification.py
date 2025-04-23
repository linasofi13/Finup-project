# schemas/notification.py
from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    type: str = "alert"

class NotificationCreate(NotificationBase):
    pass

class NotificationOut(NotificationBase):
    id: int
    read: bool
    created_at: datetime

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "message": "This is a notification message.",
                "type": "info",
                "read": False,
                "created_at": "2023-10-01T12:00:00Z"
            }
        }