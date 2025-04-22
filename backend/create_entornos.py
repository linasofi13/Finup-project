# backend/create_defaults.py

from app.database import SessionLocal
from app.models.entorno import Entorno

db = SessionLocal()

entornos_por_defecto = [
    "Entorno 1",
    "Entorno 2",
    "Entorno 3",
    "Entorno 4",
    "Entorno 5"
]

for name in entornos_por_defecto:
    if not db.query(Entorno).filter_by(name=name).first():
        db.add(Entorno(name=name))

db.commit()
db.close()

print("Entornos por defecto creados correctamente.")
