import pytest
from sqlalchemy.orm import Session
from app.models import FunctionalLeader
from app.repositories.functional_leader_repository import (
    create_functional_leader,
    get_functional_leader_by_id,
)
from app.database import SessionLocal
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))



@pytest.fixture
def db_session():
    """Fixture para obtener una sesión de la base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_creating_functional_leader(db_session: Session):
    """Prueba la creación de un Functional Leader."""
    new_functional_leader = FunctionalLeader(
        name="Test Functional Leader", email="functional@hotmail.com"
    )
    created_functional_leader = create_functional_leader(db_session, new_functional_leader)

    assert created_functional_leader is not None
    assert created_functional_leader.name == "Test Functional Leader"
    assert created_functional_leader.email == "functional@hotmail.com"


def test_get_functional_leader_by_id(db_session: Session):
    """Prueba la obtención de un Functional Leader por ID."""
    functional_leader = get_functional_leader_by_id(db_session, 1)

    assert functional_leader is not None
    assert functional_leader.id == 1
