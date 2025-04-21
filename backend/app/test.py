from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DATABASE_URL")
print("DB URL:", url)

engine = create_engine(url)

try:
    with engine.connect() as conn:
        print("✅ Conexión exitosa a la base de datos.")
except Exception as e:
    print("❌ Error al conectar:", e)
