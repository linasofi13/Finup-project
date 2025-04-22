# from sqlalchemy.orm import Session

# from app.models.role import Role
# from app.schemas.role import RoleCreate, RoleUpdate


# def create_role(db: Session, role: RoleCreate):
#     db_role = Role(**role.dict())
#     db.add(db_role)
#     db.commit()
#     db.refresh(db_role)
#     return db_role


# def get_role_by_id(db: Session, role_id: int):
#     return db.query(Role).filter(Role.id == role_id).first()


# def get_roles(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(Role).offset(skip).limit(limit).all()


# def update_role(db: Session, role_id: int, role_update_data: RoleUpdate):
#     db_role = get_role_by_id(db, role_id)
#     if db_role:
#         for key, value in role_update_data.dict(exclude_unset=True).items():
#             setattr(db_role, key, value)
#         db.commit()
#         db.refresh(db_role)
#     return db_role


# def delete_role(db: Session, role_id: int):
#     db_role = get_role_by_id(db, role_id)
#     if db_role:
#         db.delete(db_role)
#         db.commit()
#     return db_role
