from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ProviderSimple(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True  # Habilita la conversión desde ORM


class ProviderDocumentBase(BaseModel):
    provider_id: int
    file_name: str
    file_url: str


class ProviderDocumentCreate(ProviderDocumentBase):
    pass


class ProviderDocumentResponse(ProviderDocumentBase):
    id: int
    uploaded_at: datetime
    provider: Optional[ProviderSimple]  # <- Aquí incluyes la relación

    class Config:
        from_attributes = True
