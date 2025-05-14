from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth,
    users,
    evcs,
    functional_leaders,
    technical_leaders,
    entornos,
    evc_qs,
    evc_financials,
    # category_roles,
    # roles,
    # countries,
    # category_providers,
    providers,
    # role_providers,
    users,
    provider_documents,
    notification,
    notification_rules,
)
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
        "http://finup.sytes.net:3000"
    ],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(evcs.router, prefix="/evcs", tags=["EVCs"])
app.include_router(
    functional_leaders.router, prefix="/functional-leaders", tags=["Functional Leaders"]
)
app.include_router(
    technical_leaders.router, prefix="/technical-leaders", tags=["Technical Leaders"]
)
app.include_router(entornos.router, prefix="/entornos", tags=["Entornos"])
app.include_router(evc_qs.router, prefix="/evc-qs", tags=["EVC_Qs"])
app.include_router(
    evc_financials.router, prefix="/evc-financials", tags=["EVC Financials"]
)

# para subir archivos supabase y guardar la url en la base de datos
app.include_router(
    provider_documents.router, prefix="/provider-documents", tags=["ProviderDocuments"]
)
app.include_router(notification.router, prefix="/notifications", tags=["Notifications"])
app.include_router(
    notification_rules.router, prefix="/notification-rules", tags=["Notification Rules"]
)
# app.include_router(
#     category_roles.router, prefix="/category-roles", tags=["Category Roles"]
# )
# app.include_router(roles.router, prefix="/roles", tags=["Roles"])
# app.include_router(countries.router, prefix="/countries", tags=["Countries"])
# app.include_router(
#     category_providers.router, prefix="/category-providers", tags=["Category Providers"]
# )
app.include_router(providers.router, prefix="/providers", tags=["Providers"])
app.include_router(
    budget_pocket.router, prefix="/budget-pockets", tags=["Budget Pockets"]
)
app.include_router(
    budget_allocation.router, prefix="/budget-allocations", tags=["Budget Allocations"]
)
# app.include_router(
#     role_providers.router, prefix="/role-providers", tags=["Role Providers"]
# )


@app.get("/")
def read_root():
    return {"message": "Welcome to Finup API"}
