from app.database import SessionLocal
from app.models import Category
# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a test user
db = SessionLocal()
new_category = Category(name="admin")

db.add(new_category)
db.commit()
db.refresh(new_category)

print(f"✅ Category Created with ID: {new_category.category_id}")
db.close()