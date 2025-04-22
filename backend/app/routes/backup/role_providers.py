from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.role_provider as role_provider_service
from app.schemas.role_provider import (
    RoleProvider,
    RoleProviderCreate,
    RoleProviderResponse,
    RoleProviderUpdate,
)
from app.models.role_provider import RoleProvider as RoleProviderModel


router = APIRouter()

tag_name = "Role Providers"


@router.post("/", response_model=RoleProviderResponse, tags=[tag_name])
async def create_role_provider(
    role_provider_data: RoleProviderCreate, db: Session = Depends(get_db)
):
    return role_provider_service.create_role_provider(db, role_provider_data)


@router.get("/", response_model=List[RoleProviderResponse], tags=[tag_name])
async def get_role_providers(db: Session = Depends(get_db)):
    return role_provider_service.get_role_providers(db)


@router.put("/{role_provider_id}", response_model=RoleProviderResponse, tags=[tag_name])
async def update_role_provider(
    role_provider_id: int,
    role_provider_data: RoleProviderUpdate,
    db: Session = Depends(get_db),
):
    db_role_provider = role_provider_service.update_role_provider(
        db, role_provider_id, role_provider_data
    )
    if not db_role_provider:
        raise HTTPException(status_code=404, detail="RoleProvider not found")
    return db_role_provider


@router.delete(
    "/{role_provider_id}", response_model=RoleProviderResponse, tags=[tag_name]
)
async def delete_role_provider(role_provider_id: int, db: Session = Depends(get_db)):
    role_provider = role_provider_service.get_role_provider_by_id(db, role_provider_id)
    if not role_provider:
        raise HTTPException(status_code=404, detail="RoleProvider not found")
    return role_provider_service.delete_role_provider(db, role_provider_id)
