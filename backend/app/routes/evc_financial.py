from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.evc_financial import EVC_Financial
from app.models.evc_q import EVC_Q
from app.database import get_db
from pydantic import BaseModel

router = APIRouter()

class ManualSpendingCreate(BaseModel):
    value_usd: float
    concept: str = "Gasto Manual"

@router.post("/evc_financials/manual/{evc_q_id}", response_model=dict, tags=["EVC_Financials"])
async def add_manual_spending(
    evc_q_id: int, 
    spending: ManualSpendingCreate, 
    db: Session = Depends(get_db)
):
    if spending.value_usd <= 0:
        raise HTTPException(status_code=400, detail="Value must be greater than 0")
    
    quarter = db.query(EVC_Q).filter(EVC_Q.id == evc_q_id).first()
    if not quarter:
        raise HTTPException(status_code=404, detail="Quarter not found")
    
    manual_spending = EVC_Financial(
        evc_q_id=evc_q_id,
        value_usd=spending.value_usd,
        concept=spending.concept
    )
    
    db.add(manual_spending)
    db.commit()
    db.refresh(manual_spending)
    
    return {
        "message": "Manual spending added successfully",
        "spending": manual_spending
    } 