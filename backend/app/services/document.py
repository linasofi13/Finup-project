from sqlalchemy.orm import Session
from app.models.document import Document
from app.schemas.document import DocumentCreate
from fastapi import UploadFile
import os
from datetime import datetime
from app.services.supabase_client import finup_bucket


async def upload_and_create_document(db: Session, file: UploadFile) -> Document:
    """Upload file to Supabase and create document record"""
    # Get file extension
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    
    # Create unique filename
    unique_filename = f"{datetime.now().timestamp()}{file_ext}"
    file_content = await file.read()
    
    # Upload to storage
    upload_path = f"documents/{unique_filename}"
    upload_result = await finup_bucket.upload(
        upload_path,
        file_content,
        {"contentType": file.content_type}
    )
    
    if upload_result.error:
        raise Exception(f"Error uploading file: {upload_result.error}")
    
    # Get public URL
    url_result = finup_bucket.get_public_url(upload_path)
    
    # Create document record
    doc_data = DocumentCreate(
        file_name=file.filename,
        file_url=url_result.publicUrl,
        file_type=file_ext.lstrip('.')
    )
    
    # Create and save document
    db_doc = Document(**doc_data.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def get_all_documents(db: Session):
    """Get all documents"""
    return db.query(Document).all()


def delete_document(db: Session, doc_id: int):
    """Delete a document"""
    db_doc = db.query(Document).get(doc_id)
    if not db_doc:
        return False
    
    # Delete from storage if URL exists
    if db_doc.file_url:
        try:
            # Extract path from URL
            # Extract the path part after storage/
            parts = db_doc.file_url.split("/storage/")
            if len(parts) > 1:
                path = parts[1]
                finup_bucket.remove(path)
            else:
                # Fallback method
                path = db_doc.file_url.split("/")[-1]
                finup_bucket.remove(f"documents/{path}")
        except Exception as e:
            print(f"Error deleting from storage: {e}")
    
    db.delete(db_doc)
    db.commit()
    return True 