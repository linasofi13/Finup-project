from app.models.evc import EVC  # Asegura que EVC se importe antes
from app.models.evc_q import EVC_Q
from app.models.evc_financial import EVC_Financial

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Importa tu app principal y modelos
from app.main import app
from app.database import Base
from app.database import get_db

# Usa PostgreSQL para pruebas
# Ideal: crear una base de datos separada para pruebas
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/finup_test_db"

@pytest.fixture
def test_db():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Recrea las tablas para cada sesión de prueba
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()

@pytest.fixture
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c