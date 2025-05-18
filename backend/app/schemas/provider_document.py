from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ProviderSimple(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)
