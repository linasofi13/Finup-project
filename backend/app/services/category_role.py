from sqlalchemy.orm import Session
from app.models.category_role import CategoryRole
from app.schemas.category_role import CategoryRoleCreate, CategoryRoleUpdate

def create_category_role(db: Session, category_role_data: CategoryRoleCreate):
    db_category_role = CategoryRole(**category_role_data.dict())
    db.add(db_category_role)
    db.commit()
    db.refresh(db_category_role)
    return db_category_role

def get_category_role_by_id(db: Session, category_role_id: int):
    return db.query(CategoryRole).filter(CategoryRole.id == category_role_id).first()

def get_category_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CategoryRole).offset(skip).limit(limit).all()

def update_category_role(db: Session, category_role_id: int, category_role_data: CategoryRoleUpdate):
    db_category_role = get_category_role_by_id(db, category_role_id)
    if db_category_role:
        for key, value in category_role_data.dict(exclude_unset=True).items():
            setattr(db_category_role, key, value)
        db.commit()
        db.refresh(db_category_role)
    return db_category_role

def delete_category_role(db: Session, category_role_id: int):
    db_category_role = db.query(CategoryRole).filter(CategoryRole.id == category_role_id).first()
    if db_category_role:
        db.delete(db_category_role)
        db.commit()
    return db_category_role
