from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers directly for clarity
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.evcs import router as evcs_router
from app.routes.functional_leaders import router as functional_leaders_router
from app.routes.technical_leaders import router as technical_leaders_router
from app.routes.entornos import router as entornos_router
from app.routes.evc_qs import router as evc_qs_router
from app.routes.evc_financials import router as evc_financials_router
from app.routes.providers import router as providers_router
from app.routes.provider_documents import router as provider_documents_router
from app.routes.notification import router as notification_router
from app.routes.notification_rules import router as notification_rules_router
from app.routes.documents import router as documents_router

from app.api.endpoints import budget_pocket, budget_allocation
from app.database import engine, Base, SessionLocal

from app import models

models.Base.metadata.create_all(bind=engine)

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finup API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://54.162.18.167:3000",
        "http://finup.sytes.net:3000",
    ],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(evcs_router, prefix="/evcs", tags=["EVCs"])
app.include_router(
    functional_leaders_router, prefix="/functional-leaders", tags=["Functional Leaders"]
)
app.include_router(
    technical_leaders_router, prefix="/technical-leaders", tags=["Technical Leaders"]
)
app.include_router(entornos_router, prefix="/entornos", tags=["Entornos"])
app.include_router(evc_qs_router, prefix="/evc-qs", tags=["EVC_Qs"])
app.include_router(
    evc_financials_router, prefix="/evc-financials", tags=["EVC Financials"]
)

# para subir archivos supabase y guardar la url en la base de datos
app.include_router(
    provider_documents_router, prefix="/provider-documents", tags=["ProviderDocuments"]
)
app.include_router(documents_router, prefix="/documents", tags=["Documents"])
app.include_router(notification_router, prefix="/notifications", tags=["Notifications"])
app.include_router(
    notification_rules_router, prefix="/notification-rules", tags=["Notification Rules"]
)
app.include_router(providers_router, prefix="/providers", tags=["Providers"])
app.include_router(
    budget_pocket.router, prefix="/budget-pockets", tags=["Budget Pockets"]
)
app.include_router(
    budget_allocation.router, prefix="/budget-allocations", tags=["Budget Allocations"]
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Finup API"}
