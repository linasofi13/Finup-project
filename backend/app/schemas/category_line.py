from pydantic import BaseModel

class CategoryLineBase(BaseModel):
    name: str

class CategoryLineCreate(CategoryLineBase):
    pass

class CategoryLineUpdate(CategoryLineBase):
    pass

class CategoryLineResponse(CategoryLineBase):
    id: int

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "name": "Example Category Line"
            }
        }