from pydantic import BaseModel, EmailStr
from typing import Optional


class ProviderBase(BaseModel):
    name: str
    role: str
    company: str
    country: str
    cost_usd: float
    category: str
    line: str
    email: EmailStr


class ProviderCreate(ProviderBase):
    pass  # validate provider creation


class ProviderResponse(ProviderBase):
    id: int

    class Config:
        from_attributes = True