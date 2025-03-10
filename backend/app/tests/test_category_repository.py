from sqlalchemy.orm import Session
from app.models.category import Category
from app.repositories.category_repository import create_category, get_category_by_name, get_category_by_id
from app.database import SessionLocal

# Setup test database session
def get_test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_category():
    db: Session = next(get_test_db())

    # Create category
    new_category = Category(name="Test Category")
    created_category = create_category(db, new_category)

    assert created_category is not None
    assert created_category.name == "Test Category"

def test_get_category_by_name():
    db: Session = next(get_test_db())

    # Retrieve category
    category = get_category_by_name(db, "Test Category")
    
    assert category is not None
    assert category.name == "Test Category"

def test_get_category_by_id():
    db: Session = next(get_test_db())

    # Retrieve category by ID
    category = get_category_by_id(db, 1)

    assert category is not None
    assert category.category_id == 1
