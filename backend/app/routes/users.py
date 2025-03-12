from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/users/", response_model=List[UserResponse])
async def read_users(
    current_user: User = Depends(get_current_user),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/me", response_model=UserResponse)
async def get_my_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users/debug")
async def debug_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()
        return [{"id": user.id, "email": user.email, "username": user.username} for user in users]
    except Exception as e:
        return {"error": str(e)}