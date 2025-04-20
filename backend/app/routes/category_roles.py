from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.category_role as category_role_service
from app.schemas.category_role import (
    CategoryRole,
    CategoryRoleCreate,
    CategoryRoleResponse,
    CategoryRoleUpdate,
)
from app.models.category_role import CategoryRole as CategoryRoleModel


router = APIRouter()

tag_name = "Category Roles"


@router.post("/category-roles/", response_model=CategoryRoleResponse, tags=[tag_name])
async def create_category_role(
    category_role_data: CategoryRoleCreate, db: Session = Depends(get_db)
):
    return category_role_service.create_category_role(db, category_role_data)


@router.get(
    "/category-roles/", response_model=List[CategoryRoleResponse], tags=[tag_name]
)
async def get_category_roles(db: Session = Depends(get_db)):
    return category_role_service.get_category_roles(db)


@router.put(
    "/category-roles/{category_role_id}",
    response_model=CategoryRoleResponse,
    tags=[tag_name],
)
async def update_category_role(
    category_role_id: int,
    category_role_data: CategoryRoleUpdate,
    db: Session = Depends(get_db),
):
    db_category_role = category_role_service.update_category_role(
        db, category_role_id, category_role_data
    )
    if not db_category_role:
        raise HTTPException(status_code=404, detail="CategoryRole not found")
    return db_category_role


@router.delete(
    "/category-roles/{category_role_id}",
    response_model=CategoryRoleResponse,
    tags=[tag_name],
)
async def delete_category_role(category_role_id: int, db: Session = Depends(get_db)):
    category_role = category_role_service.get_category_role_by_id(db, category_role_id)
    if not category_role:
        raise HTTPException(status_code=404, detail="CategoryRole not found")
    return category_role_service.delete_category_role(db, category_role_id)
