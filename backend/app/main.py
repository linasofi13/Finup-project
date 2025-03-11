from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, users, evcs, providers  # Import the new routers
from app.database import engine, Base

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
)  # Include the evcs router
app.include_router(
    providers.router, prefix="/providers", tags=["Providers"]
)  # Include the providers router


@app.get("/")
def read_root():
    return {"message": "Welcome to Finup API"}
