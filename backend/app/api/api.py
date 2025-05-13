from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    users,
    evcs,
    entornos,
    functional_leaders,
    technical_leaders,
    providers,
    documents,
    budget_pocket,
    budget_allocation,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(evcs.router, prefix="/evcs", tags=["evcs"])
api_router.include_router(entornos.router, prefix="/entornos", tags=["entornos"])
api_router.include_router(
    functional_leaders.router, prefix="/functional-leaders", tags=["functional-leaders"]
)
api_router.include_router(
    technical_leaders.router, prefix="/technical-leaders", tags=["technical-leaders"]
)
api_router.include_router(providers.router, prefix="/providers", tags=["providers"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(budget_pocket.router, prefix="/budget-pockets", tags=["budget-pockets"])
api_router.include_router(budget_allocation.router, prefix="/budget-allocations", tags=["budget-allocations"]) 