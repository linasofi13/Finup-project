from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

from app.schemas.evc_financial import EVC_FinancialCreate, EVC_FinancialUpdate, EVC_FinancialShortResponse
from app.models.evc_financial import EVC_Financial
import app.services.evc_financial as evc_financial_service

router = APIRouter()

tag_name="EVC Financials"

@router.post("/evc_financials/", response_model=EVC_FinancialShortResponse, tags=[tag_name])
async def create_evc_financial(evc_financial: EVC_FinancialCreate, db: Session = Depends(get_db)):
    return evc_financial_service.create_evc_financial(db=db, evc_financial_data=evc_financial)

@router.get("/evc_financials/", response_model=List[EVC_FinancialShortResponse], tags=[tag_name])
async def read_evc_financials(db: Session = Depends(get_db)):
    evc_financials = evc_financial_service.get_evc_financials(db)
    return evc_financials

@router.put("/evc_financials/{evc_financial_id}", response_model=EVC_FinancialShortResponse, tags=[tag_name])
async def update_evc_financial(evc_financial_id: int, evc_financial: EVC_FinancialUpdate, db: Session = Depends(get_db)):
    db_evc_financial = evc_financial_service.update_evc_financial(db, evc_financial_id, evc_financial)
    if db_evc_financial is None:
        raise HTTPException(status_code=404, detail="EVC Financial not found")
    return db_evc_financial

@router.delete("/evc_financials/{evc_financial_id}", response_model=EVC_FinancialShortResponse, tags=[tag_name])
async def delete_evc_financial(evc_financial_id: int, db: Session = Depends(get_db)):
    db_evc_financial = evc_financial_service.delete_evc_financial(db, evc_financial_id)
    if db_evc_financial is None:
        raise HTTPException(status_code=404, detail="EVC Financial not found")
    return db_evc_financial