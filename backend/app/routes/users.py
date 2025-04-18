
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.user as user_service
from app.schemas.user import User, UserCreate, UserResponse, UserUpdate
from app.models.user import User as UserModel


router = APIRouter()

tag_name="Users"

@router.post("/", response_model=UserResponse, tags=[tag_name])
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user_data)

@router.get("/", response_model=List[UserResponse], tags=[tag_name])
async def get_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)

@router.put("/{user_id}", response_model=UserResponse, tags=[tag_name])
async def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    db_user= user_service.update_user(db, user_id, user_data)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}", response_model=UserResponse, tags=[tag_name])
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.delete_user(db, user_id)


