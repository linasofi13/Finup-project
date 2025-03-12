from sqlalchemy.orm import Session
from app.models.app_user import AppUser
# from app.models import AppUser


def get_user_by_username(db_session: Session, username: str) -> AppUser:
    return db_session.query(AppUser).filter(AppUser.username == username).first()


def get_user_by_id(db_session: Session, user_id: int) -> AppUser:
    return db_session.query(AppUser).filter(AppUser.id == user_id).first()


def create_user(db_session: Session, user: AppUser) -> AppUser:
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
