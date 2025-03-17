from app.database import SessionLocal
from app.models.leader import TechnicalLeader, FunctionalLeader
from app.models.entorno import Entorno

def create_test_data():
    db = SessionLocal()
    
    # Create test technical leaders
    tech_leaders = [
        TechnicalLeader(name="John Tech", email="john.tech@company.com"),
        TechnicalLeader(name="Alice Tech", email="alice.tech@company.com")
    ]
    
    # Create test functional leaders
    func_leaders = [
        FunctionalLeader(name="Bob Func", email="bob.func@company.com"),
        FunctionalLeader(name="Carol Func", email="carol.func@company.com")
    ]
    
    # Create test environments
    entornos = [
        Entorno(nombre="Desarrollo", descripcion="Ambiente de desarrollo"),
        Entorno(nombre="QA", descripcion="Ambiente de pruebas"),
        Entorno(nombre="Producción", descripcion="Ambiente productivo")
    ]
    
    try:
        for leader in tech_leaders + func_leaders:
            db.add(leader)
        for entorno in entornos:
            db.add(entorno)
        db.commit()
        print("✅ Test data created successfully")
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()