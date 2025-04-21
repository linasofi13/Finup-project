import sys
import os

# Añadir la carpeta raíz del backend al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database import SessionLocal
from app.models.category_line import CategoryLine
from sqlalchemy.orm import Session

def seed_category_lines():
    db: Session = SessionLocal()

    category_lines = ["Técnica", "Funcional", "Legal", "Estrategia", "Soporte", "Operaciones"]

    for name in category_lines:
        if not db.query(CategoryLine).filter_by(name=name).first():
            db.add(CategoryLine(name=name))

    db.commit()
    db.close()
    print("✅ Líneas de categoría insertadas correctamente.")

if __name__ == "__main__":
    seed_category_lines()
