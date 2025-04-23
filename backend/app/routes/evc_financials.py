from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

from app.schemas.evc_financial import (
    EVC_FinancialCreate,
    EVC_FinancialCreateConcept,
    EVC_FinancialUpdate,
    EVC_FinancialResponse,
)
from app.models.evc_financial import EVC_Financial
from app.schemas.provider import ProviderResponse
import app.services.evc_financial as evc_financial_service

router = APIRouter()

tag_name = "EVC Financials"


@router.post(
    "/evc_financials/", response_model=EVC_FinancialResponse, tags=[tag_name]
)
async def create_evc_financial(
    evc_financial: EVC_FinancialCreate, db: Session = Depends(get_db)
):
    return evc_financial_service.create_evc_financial(
        db=db, evc_financial_data=evc_financial
    )


@router.post( "/evc_financials/concept", response_model=EVC_FinancialResponse, tags=[tag_name])
async def create_evc_financial_concept(evc_financial_data: EVC_FinancialCreateConcept, db: Session = Depends(get_db)
):
    return evc_financial_service.create_evc_financial_concept(
        db=db, evc_financial_data=evc_financial_data
    )
@router.get(
    "/evc_financials/", response_model=List[EVC_FinancialResponse], tags=[tag_name]
)
async def read_evc_financials(db: Session = Depends(get_db)):
    evc_financials = evc_financial_service.get_evc_financials(db)
    return evc_financials


@router.put(
    "/evc_financials/{evc_financial_id}",
    response_model=EVC_FinancialResponse,
    tags=[tag_name],
)
async def update_evc_financial(
    evc_financial_id: int,
    evc_financial: EVC_FinancialUpdate,
    db: Session = Depends(get_db),
):
    db_evc_financial = evc_financial_service.update_evc_financial(
        db, evc_financial_id, evc_financial
    )
    if db_evc_financial is None:
        raise HTTPException(status_code=404, detail="EVC Financial not found")
    return db_evc_financial


@router.delete(
    "/evc_financials/{evc_financial_id}",
    response_model=EVC_FinancialResponse,
    tags=[tag_name],
)
async def delete_evc_financial(evc_financial_id: int, db: Session = Depends(get_db)):
    db_evc_financial = evc_financial_service.delete_evc_financial(db, evc_financial_id)
    if db_evc_financial is None:
        raise HTTPException(status_code=404, detail="EVC Financial not found")
    return db_evc_financial


@router.get(
    "/evc_financials/{evc_q_id}/spendings",
    response_model=dict,
    tags=[tag_name],
)
async def get_spendings_by_evc_q(
    evc_q_id: int, db: Session = Depends(get_db)
) -> float:
    """
    Get the total spendings (sum of RoleProvider.price_usd) for a given evc_q_id.
    """
    total = evc_financial_service.get_spendings_by_evc_q(db, evc_q_id)
    percentage= evc_financial_service.get_percentage_by_evc_q(db, evc_q_id)
    if percentage >=1:
        message="No hay más presupuesto"   
    elif percentage>=.8:
        message="Ya casi te quedas sin presupuesto"
    elif percentage>=.5:
        message="Vas a la mitad del presupuesto"
    else:
        message="Presupuesto suficiente"
    
    return {"evc_q_id": evc_q_id, "total_spendings": total, "percentage": percentage*100, "message": message}


@router.get("/evc-financials/{evc_q_id}/providers", response_model=List[ProviderResponse], tags=[tag_name])
async def get_providers_by_evc_q(
    evc_q_id: int, db: Session = Depends(get_db)
):
    providers= evc_financial_service.get_providers_by_evc_q(db, evc_q_id)
    if not providers:
        raise HTTPException(status_code=404, detail="No providers found for this EVC Q")
    return providers


    
# @router.get(
#     "/evc_financials/{evc_q_id}/percentage",
#     response_model=dict,
#     tags=[tag_name],
# )
# async def get_percentage_by_evc_q(
#     evc_q_id: int, db: Session = Depends(get_db)
# ) -> float:
#     """
#     Get the percentage of spendings for a given evc_q_id.
#     """
#     percentage = evc_financial_service.get_percentage_by_evc_q(db, evc_q_id)
#     if percentage ==1:
#         message="No more budget left"
#     elif percentage>=.9:
#         message="Almost out of budget"
#     elif percentage>=.8:
#         message="Budget is getting low"
#     elif percentage>=.5:
#         message="Budget is getting low"
#     else:
#         message="Budget is sufficient"
        
#     return {"evc_q_id": evc_q_id, "percentage": percentage, "message": message}