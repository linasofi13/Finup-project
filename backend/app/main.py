from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.providers import router as providers_router
from app.api.routes.users import router as users_router
from app.api.routes.evcs import router as evcs_router

app = FastAPI(
    title="Finup API",
    version="1.0",
    description="""
    Finup API is designed to manage Providers and EVCs efficiently.
    ## Features:
    - **Providers Management**: CRUD operations for providers.
    - **EVCs Management**: CRUD operations for EVCs.
    - **Users**: Basic user management.
        """,
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# CORS middleware
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(users_router, prefix="/api/users")
app.include_router(providers_router, prefix="/api/providers")
app.include_router(evcs_router, prefix="/api/evcs")


@app.get("/")
def root():
    """Root endpoint for health check"""
    return {"message": "Welcome to the Finup API"}
