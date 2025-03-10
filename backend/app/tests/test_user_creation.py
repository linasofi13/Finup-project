from app.database import SessionLocal
from app.models import AppUser
# Import your User model
from passlib.context import CryptContext
# from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a test user
db = SessionLocal()
new_user = AppUser(username="testuser", password_hash=pwd_context.hash("testpassword123"))

db.add(new_user)
db.commit()
db.refresh(new_user)

print(f"✅ User created with ID: {new_user.app_user_id}")
db.close()