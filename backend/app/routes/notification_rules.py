from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification_rule import NotificationRule
from app.schemas.notification_rule import NotificationRuleCreate, NotificationRuleOut

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
def update_rule(rule_id: int, rule: NotificationRuleCreate, db: Session = Depends(get_db)):
    db_rule = db.query(NotificationRule).get(rule_id)
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    for field, value in rule.dict().items():
        setattr(db_rule, field, value)
    db.commit()
    db.refresh(db_rule)
    return db_rule
