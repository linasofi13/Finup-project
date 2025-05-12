from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification_rule import NotificationRule
from app.schemas.notification_rule import NotificationRuleCreate, NotificationRuleOut
from pydantic import BaseModel
from typing import List

class BulkDeleteRequest(BaseModel):
    rule_ids: List[int]

router = APIRouter(prefix="/notification-rules", tags=["Notification Rules"])


@router.get("/", response_model=list[NotificationRuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(NotificationRule).all()


@router.post("/", response_model=NotificationRuleOut)
def create_rule(rule: NotificationRuleCreate, db: Session = Depends(get_db)):
    db_rule = NotificationRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.patch("/{rule_id}", response_model=NotificationRuleOut)
def update_rule(
    rule_id: int, rule: NotificationRuleCreate, db: Session = Depends(get_db)
):
    db_rule = db.query(NotificationRule).get(rule_id)
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    for field, value in rule.dict().items():
        setattr(db_rule, field, value)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.delete("/bulk")
def delete_rules_bulk(request: BulkDeleteRequest, db: Session = Depends(get_db)):
    db.query(NotificationRule).filter(NotificationRule.id.in_(request.rule_ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"{len(request.rule_ids)} rules deleted successfully"}


@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    db_rule = db.query(NotificationRule).get(rule_id)
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(db_rule)
    db.commit()
    return {"message": "Rule deleted successfully"}
