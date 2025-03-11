from pydantic import BaseModel


class EVCBase(BaseModel):
    pass


class EVCCreate(EVCBase):
    pass


class EVCResponse(EVCBase):
    id: int

    class Config:
        orm_mode = True
