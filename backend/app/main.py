from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, users, evcs, providers, functional_leaders, technical_leaders, entornos  # Import the new routers
from app.database import engine, Base, SessionLocal

from app import models

models.Base.metadata.create_all(bind=engine)

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finup API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(
    evcs.router, prefix="/evcs", tags=["EVCs"]
)
app.include_router(
    functional_leaders.router, prefix="/functional-leaders", tags=["Functional Leaders"]
)
app.include_router( technical_leaders.router, prefix="/technical-leaders", tags=["Technical Leaders"])
app.include_router(entornos.router, prefix="/entornos", tags=["Entornos"])
# Include the evcs router
# app.include_router(
#     providers.router, prefix="/providers", tags=["Providers"]
# )  # Include the providers router


@app.get("/")
def read_root():
    return {"message": "Welcome to Finup API"}
