from sqlalchemy.orm import Session
from backend.app.models.app_user import AppUser
from app.repositories.app_user_repository import create_user, get_user_by_username
from app.database import SessionLocal


def get_test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_create_user():
    db: Session = next(get_test_db())

    # Create user
    new_user = AppUser(username="testuser", password_hash="password123")
    created_user = create_user(db, new_user)

    assert created_user is not None
    assert created_user.username == "testuser"


def test_get_user_by_username():
    db: Session = next(get_test_db())

    # Retrieve user
    user = get_user_by_username(db, "testuser")

    assert user is not None
    assert user.username == "testuser"
