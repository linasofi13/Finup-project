from fastapi import APIRouter

router = APIRouter()

@router.get("/users", tags=["Users"])
def get_users():
    """Retrieve a list of users."""
    return {"message": "List of users"}
