from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.provider_document import (
    ProviderDocumentCreate,
    ProviderDocumentResponse,
)
from app.services.provider_document import (
    create_provider_document,
    get_documents_by_provider,
    delete_provider_document,
    get_all_provider_documents,
)
from fastapi import HTTPException, status

router = APIRouter()


@router.post("/", response_model=ProviderDocumentResponse)
def register_document(doc_data: ProviderDocumentCreate, db: Session = Depends(get_db)):
    return create_provider_document(db, doc_data)


@router.get("/by-provider/{provider_id}", response_model=list[ProviderDocumentResponse])
def list_documents(provider_id: int, db: Session = Depends(get_db)):
    return get_documents_by_provider(db, provider_id)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    success = delete_provider_document(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return


@router.get("/", response_model=list[ProviderDocumentResponse])
def list_all_documents(db: Session = Depends(get_db)):
    return get_all_provider_documents(db)
