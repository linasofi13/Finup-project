import sys
import os

# Añadir la carpeta raíz del backend al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database import SessionLocal
from app.models.category_provider import CategoryProvider
from app.models.category_role import CategoryRole
from app.models.country import Country
from sqlalchemy.orm import Session

def seed_data():
    db: Session = SessionLocal()

    category_providers = ["Técnica", "Legal", "Funcional", "Operativa", "Especializada", "Estrategia"]
    category_roles = ["Junior", "Semi Senior", "Senior", "Lead", "Architect", "Consultor", "Intern", "Freelance"]
    countries = ["Colombia", "México", "Argentina", "Chile", "Perú", "EEUU", "Canadá", "España", "Brasil", "Alemania"]

    for name in category_providers:
        if not db.query(CategoryProvider).filter_by(name=name).first():
            db.add(CategoryProvider(name=name))

    for name in category_roles:
        if not db.query(CategoryRole).filter_by(name=name).first():
            db.add(CategoryRole(name=name))

    for name in countries:
        if not db.query(Country).filter_by(name=name).first():
            db.add(Country(name=name))

    db.commit()
    db.close()
    print("✅ Datos iniciales insertados correctamente.")

if __name__ == "__main__":
    seed_data()
