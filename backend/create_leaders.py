# scripts/create_leaders.py

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.technical_leader import TechnicalLeader
from app.models.functional_leader import FunctionalLeader


db: Session = SessionLocal()

# Crear líderes técnicos
tech_leaders = [
    TechnicalLeader(name="Juan Pérez", email="juan@finup.com"),
    TechnicalLeader(name="Andrea Gómez", email="andrea@finup.com"),
]

# Crear líderes funcionales
func_leaders = [
    FunctionalLeader(name="Ana Martínez", email="lina@finup.com"),
    FunctionalLeader(name="Carlos Duarte", email="carlos@finup.com"),
]

db.add_all(tech_leaders + func_leaders)
db.commit()
db.close()

print("Líderes creados correctamente.")
