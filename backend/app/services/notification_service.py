# app/services/notification_service.py
from app.repositories.notification_rule_repository import get_active_rules_by_table
from app.repositories.notification_repository import create_notification
from sqlalchemy.orm import Session
from app.models.notification import Notification

async def evaluate_rules_for_entity(entity_data: dict, table_name: str):
    rules = await get_active_rules_by_table(table_name)

    for rule in rules:
        field = rule.condition_field
        value = entity_data.get(field)

        if value is None:
            continue

        if rule.comparison == ">" and value > rule.threshold:
            triggered = True
        elif rule.comparison == "<" and value < rule.threshold:
            triggered = True
        elif rule.comparison == "==" and value == rule.threshold:
            triggered = True
        elif rule.comparison == ">=" and value >= rule.threshold:
            triggered = True
        elif rule.comparison == "<=" and value <= rule.threshold:
            triggered = True
        else:
            triggered = False

        if triggered:
            await create_notification({
                "message": rule.message,
                "type": rule.type
            })

def get_unread_notifications(db: Session):
    """Returns all unread notifications."""
    return db.query(Notification).filter(Notification.read == False).order_by(Notification.created_at.desc()).all()