from sqlalchemy.orm import Session
from app.models.category import Category


def get_category_by_name(db_session: Session, name: str) -> Category:
    return db_session.query(Category).filter(Category.name == name).first()


def get_category_by_id(db_session: Session, category_id: int) -> Category:
    return (
        db_session.query(Category).filter(Category.category_id == category_id).first()
    )


def create_category(db_session: Session, category: Category) -> Category:
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category
