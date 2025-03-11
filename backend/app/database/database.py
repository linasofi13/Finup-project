from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.env import DATABASE_URL  # Ensure this exists in `env.py`

# Create database engine
engine = create_engine(DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model for all ORM models
Base = declarative_base()


# Dependency function for getting the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
