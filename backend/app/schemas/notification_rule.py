# schemas/notification_rule.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationRuleBase(BaseModel):
    name: str
    target_table: str
    condition_field: str
    threshold: float
    comparison: str
    message: str
    type: Optional[str] = "alert"
    active: Optional[bool] = True


class NotificationRuleCreate(NotificationRuleBase):
    pass


class NotificationRuleOut(NotificationRuleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
