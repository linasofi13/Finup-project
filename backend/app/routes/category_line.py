from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category_line import CategoryLine
from app.schemas.category_line import CategoryLineCreate, CategoryLineUpdate, CategoryLineResponse

router = APIRouter(prefix="/category-lines", tags=["Category Lines"])

@router.get("/", response_model=list[CategoryLineResponse])
def get_all_lines(db: Session = Depends(get_db)):
    return db.query(CategoryLine).all()

@router.post("/", response_model=CategoryLineResponse)
def create_line(line: CategoryLineCreate, db: Session = Depends(get_db)):
    new_line = CategoryLine(name=line.name)
    db.add(new_line)
    db.commit()
    db.refresh(new_line)
    return new_line

@router.put("/{line_id}", response_model=CategoryLineResponse)
def update_line(line_id: int, update: CategoryLineUpdate, db: Session = Depends(get_db)):
    line = db.query(CategoryLine).get(line_id)
    if not line:
        raise HTTPException(status_code=404, detail="Line not found")
    line.name = update.name
    db.commit()
    return line

@router.delete("/{line_id}")
def delete_line(line_id: int, db: Session = Depends(get_db)):
    line = db.query(CategoryLine).get(line_id)
    if not line:
        raise HTTPException(status_code=404, detail="Line not found")
    db.delete(line)
    db.commit()
    return {"ok": True}
