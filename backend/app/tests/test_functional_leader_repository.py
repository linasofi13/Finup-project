import pytest
from sqlalchemy.orm import Session
from app.models import FunctionalLeader
from app.repositories import (
    create_functional_leader,
    get_functional_leader_by_id,
    get_functional_leader_by_name,
)
from app.database import engine, Base, SessionLocal


# Fixture for database session
@pytest.fixture(scope="function")
def db_session():
    """Provides a database session for each test function."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Fixture for sample FunctionalLeader
@pytest.fixture(scope="function")
def sample_functional_leader(db_session: Session):
    """Creates a Functional Leader and commits it to the test database."""
    new_leader = FunctionalLeader(
        name="Test FunctionalLeader", email="somemail@mail.com"
    )
    new_leader = create_functional_leader(db_session, new_leader)
    return new_leader


# Test functions
def test_create_functional_leader(db_session: Session):
    """Test Functional Leader creation"""
    new_leader = FunctionalLeader(
        name="Test FunctionalLeader", email="somemail@mail.com"
    )
    created_leader = create_functional_leader(db_session, new_leader)

    assert created_leader is not None
    assert created_leader.name == "Test FunctionalLeader"
    assert created_leader.email == "somemail@mail.com"


def test_get_functional_leader_by_name(sample_functional_leader, db_session: Session):
    new_leader = FunctionalLeader(
        name="Test FunctionalLeader", email="somemail@mail.com"
    )
    created_leader = create_functional_leader(db_session, new_leader)
    """Test retrieving Functional Leader by name"""
    functional_leader = get_functional_leader_by_name(
        db_session, "Test FunctionalLeader"
    )

    assert (
        functional_leader is not None
    ), "Functional Leader was not found in the database!"
    assert functional_leader.name == "Test FunctionalLeader"
    assert functional_leader.email == "somemail@mail.com"


def test_get_functional_leader_by_id(sample_functional_leader, db_session: Session):
    new_leader = FunctionalLeader(
        name="Test FunctionalLeader", email="somemail@mail.com"
    )
    created_leader = create_functional_leader(db_session, new_leader)
    """Test retrieving Functional Leader by ID"""
    functional_leader = get_functional_leader_by_id(
        db_session, sample_functional_leader.id
    )

    assert functional_leader is not None, "Functional Leader was not found by ID!"
    assert functional_leader.id == sample_functional_leader.id
    assert functional_leader.name == "Test FunctionalLeader"
    assert functional_leader.email == "somemail@mail.com"
