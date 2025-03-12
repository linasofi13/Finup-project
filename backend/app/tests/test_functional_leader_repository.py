from app.models import FunctionalLeader
from sqlalchemy.orm import Session
from app.repositories.functional_leader_repository import create_functional_leader, get_functional_leader_by_name, get_functional_leader_by_id

from app.database import SessionLocal
# Setup test database session
def get_test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_creating_functional_leader():
    # Create a new functional leader
    db: Session = next(get_test_db())
    new_functional_leader = FunctionalLeader(name="Test Functional Leader", email="functional@hotmail.com")
    created_functional_leader = create_functional_leader(db, new_functional_leader)
    assert created_functional_leader is not None
    assert created_functional_leader.name == "Test Functional Leader"
    assert created_functional_leader.email == "functional@hotmail.com"
    
def test_get_category_by_id():
    db: Session = next(get_test_db())
    # Retrieve category by ID
    functional_leader = get_functional_leader_by_id(db, 1)

    assert functional_leader is not None
    assert functional_leader.id == 1