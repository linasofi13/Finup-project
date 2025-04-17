from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.models.role import Role
import app.services.role as role_service

router = APIRouter()

tag_name= "Roles"

@router.post("/", response_model=RoleResponse, tags=[tag_name])
async def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    return role_service.create_role(db=db, role=role)

@router.get("/", response_model=List[RoleResponse], tags=[tag_name])
async def get_roles(db: Session = Depends(get_db)):
    return role_service.get_roles(db)

@router.put("/{role_id}", response_model=RoleResponse, tags=[tag_name])
async def update_role(role_id: int, role_update_data: RoleUpdate, db: Session= Depends(get_db)):
    db_role = role_service.update_role(db=db, role_id=role_id, role_update_data=role_update_data)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role

@router.delete("/{role_id}", response_model=RoleResponse, tags=[tag_name])
async def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = role_service.delete_role(db=db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role