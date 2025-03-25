from pydantic import BaseModel

class EntornoBase(BaseModel):
    nombre: str
    descripcion: str | None = None

class EntornoCreate(EntornoBase):
    pass

class EntornoResponse(EntornoBase):
    id: int

    class Config:
        orm_mode = True