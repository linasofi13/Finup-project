# app/repositories/notification_rule_repository.py
from app.models.notification_rule import NotificationRule
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Session


def get_active_rules_by_table(db: Session, table_name: str):
    return db.query(NotificationRule).filter(
        NotificationRule.target_table == table_name,
        NotificationRule.active == True
    ).all()

