from sqlalchemy.orm import Session, joinedload
from app.models.provider_document import ProviderDocument
from app.schemas.provider_document import ProviderDocumentCreate

def create_provider_document(db: Session, doc_data: ProviderDocumentCreate):
    db_doc = ProviderDocument(**doc_data.dict())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_documents_by_provider(db: Session, provider_id: int):
    return db.query(ProviderDocument).filter(ProviderDocument.provider_id == provider_id).all()

def delete_provider_document(db: Session, doc_id: int):
    db_doc = db.query(ProviderDocument).get(doc_id)
    if not db_doc:
        return None
    db.delete(db_doc)
    db.commit()
    return True


def get_all_provider_documents(db: Session):
    return db.query(ProviderDocument).options(joinedload(ProviderDocument.provider)).all()
