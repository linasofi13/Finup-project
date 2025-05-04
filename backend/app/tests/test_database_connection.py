from app.database import SessionLocal

# Open a session and check if we can connect
try:
    db = SessionLocal()
    print("✅ Database connection successful!")
except Exception as e:
    print("❌ Database connection failed:", e)
finally:
    db.close()
