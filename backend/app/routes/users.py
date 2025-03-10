from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/users/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of users. Only accessible to authenticated users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/me", response_model=UserResponse)
async def get_my_info(current_user: User = Depends(get_current_user)):
    """
    Get information about the currently authenticated user.
    """
    return current_user