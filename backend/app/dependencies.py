from database import SessionLocal

def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()