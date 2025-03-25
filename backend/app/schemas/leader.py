from pydantic import BaseModel

class LeaderBase(BaseModel):
    name: str
    email: str

class LeaderCreate(LeaderBase):
    pass

class LeaderResponse(LeaderBase):
    id: int

    class Config:
        orm_mode = True