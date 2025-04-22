model_import = input("Enter the model name (e.g., country): ")
snake_case = input("Enter the snake_case name (e.g., country): ")
text = f"""
from sqlalchemy.orm import Session

from app.models.{snake_case} import {model_import}
from app.schemas.{snake_case} import {model_import}Create, {model_import}Update

def create_{snake_case}(db: Session, {snake_case}_data: {model_import}Create):
    db_{snake_case} = {model_import}(**{snake_case}_data.dict())
    db.add(db_{snake_case})
    db.commit()
    db.refresh(db_{snake_case})
    return db_{snake_case}

def get_{snake_case}_by_id(db: Session, {snake_case}_id: int):
    return db.query({model_import}).filter({model_import}.id == {snake_case}_id).first()

def get_{snake_case}s(db: Session, skip: int = 0, limit: int = 100):
    return db.query({model_import}).offset(skip).limit(limit).all()

def update_{snake_case}(db: Session, {snake_case}_id: int, {snake_case}_update_data: {model_import}Update):
    db_{snake_case} = get_{snake_case}_by_id(db, {snake_case}_id)
    if db_{snake_case}:
        for key, value in {snake_case}_update_data.dict(exclude_unset=True).items():
            setattr(db_{snake_case}, key, value)
        db.commit()
        db.refresh(db_{snake_case})
    return db_{snake_case}

def delete_{snake_case}(db: Session, {snake_case}_id: int):
    db_{snake_case} = get_{snake_case}_by_id(db, {snake_case}_id)
    if db_{snake_case}:
        db.delete(db_{snake_case})
        db.commit()
    return db_{snake_case}"""

import os

# Construct the full file path
file_path = f"services/{snake_case}.py"

# Ensure the directory exists
os.makedirs(os.path.dirname(file_path), exist_ok=True)

print(file_path)
# Now you can write the file
with open(file_path, "w") as file:
    file.write(text)


routes_text = f"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

import app.services.{snake_case} as {snake_case}_service
from app.schemas.{snake_case} import {model_import}, {model_import}Create, {model_import}Response, {model_import}Update
from app.models.{snake_case} import {model_import} as {model_import}Model


router = APIRouter()

tag_name="{model_import}s"

@router.post("/", response_model={model_import}Response, tags=[tag_name])
async def create_{snake_case}({snake_case}_data: {model_import}Create, db: Session = Depends(get_db)):
    return {snake_case}_service.create_{snake_case}(db, {snake_case}_data)

@router.get("/", response_model=List[{model_import}Response], tags=[tag_name])
async def get_{snake_case}s(db: Session = Depends(get_db)):
    return {snake_case}_service.get_{snake_case}s(db)

@router.put("/¿{snake_case}_id?", response_model={model_import}Response, tags=[tag_name])
async def update_{snake_case}({snake_case}_id: int, {snake_case}_data: {model_import}Update, db: Session = Depends(get_db)):
    db_{snake_case}= {snake_case}_service.update_{snake_case}(db, {snake_case}_id, {snake_case}_data)
    if not db_{snake_case}:
        raise HTTPException(status_code=404, detail="{model_import} not found")
    return db_{snake_case}

@router.delete("/¿{snake_case}_id?", response_model={model_import}Response, tags=[tag_name])
async def delete_{snake_case}({snake_case}_id: int, db: Session = Depends(get_db)):
    {snake_case} = {snake_case}_service.get_{snake_case}_by_id(db, {snake_case}_id)
    if not {snake_case}:
        raise HTTPException(status_code=404, detail="{model_import} not found")
    return {snake_case}_service.delete_{snake_case}(db, {snake_case}_id)


"""

routes_text = routes_text.replace("¿", "{")
routes_text = routes_text.replace("?", "}")


# Construct the full file path
file_path_routes = f"routes/{snake_case}s.py"

# Ensure the directory exists
os.makedirs(os.path.dirname(file_path_routes), exist_ok=True)

# Now you can write the file
with open(file_path_routes, "w") as file:
    file.write(routes_text)
