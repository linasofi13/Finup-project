from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# # Determinar si estamos en modo desarrollo o producción
# ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# # Configurar la URL de la base de datos según el entorno
# if ENVIRONMENT == "production":
#     SQLALCHEMY_DATABASE_URL = os.getenv(
#         "DATABASE_URL", "postgresql://postgres:%40Luna1022@localhost:5432/finup"
#     )
# else:
#     # Usar SQLite para desarrollo
#     SQLALCHEMY_DATABASE_URL = "sqlite:///./finup.db"

# # Crear el motor de base de datos
# if ENVIRONMENT == "development" and SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
#     engine = create_engine(
#         SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
#     )
# else:
#     engine = create_engine(SQLALCHEMY_DATABASE_URL)

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:%40Luna1022@localhost/finup"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Función para obtener la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
