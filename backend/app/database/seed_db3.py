import sys
import os

# Añadir la carpeta raíz del backend al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database import SessionLocal
from app.models.role import Role
from sqlalchemy.orm import Session

# Diccionario que relaciona nombre del rol con su category_role_id correspondiente
ROLE_DATA = [
    ("Backend Jr", 1),           # Desarrollador
    ("Backend Sr", 1),
    ("Data Engineer", 2),        # Ingeniero de Datos
    ("DevOps Engineer", 3),      # Ingeniero DevOps
    ("UX/UI Designer", 4),       # Diseñador UX/UI
    ("QA Tester", 5),            # QA Tester
    ("Scrum Master", 6),         # Scrum Master
    ("Product Manager", 7),      # Product Manager
]

def seed_roles():
    db: Session = SessionLocal()

    for name, category_role_id in ROLE_DATA:
        if not db.query(Role).filter_by(name=name).first():
            db.add(Role(name=name, category_role_id=category_role_id))

    db.commit()
    db.close()
    print("✅ Roles insertados correctamente.")

if __name__ == "__main__":
    seed_roles()
