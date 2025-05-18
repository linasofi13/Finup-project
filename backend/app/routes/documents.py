from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.document import DocumentResponse
from app.services.document import (
    upload_and_create_document,
    get_all_documents,
    delete_document,
)
from typing import List

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Document",
    description="Upload a document without associating it with a provider. The file will be stored in Supabase storage.",
    responses={
        201: {
            "description": "Document created successfully",
            "model": DocumentResponse,
        },
        500: {"description": "Internal server error"},
    },
)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a new document without associating it with a provider.

    - **file**: The file to upload (multipart/form-data)
    """
    try:
        return await upload_and_create_document(db, file)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/",
    response_model=List[DocumentResponse],
    summary="List Documents",
    description="Get all documents that are not associated with any provider.",
    responses={
        200: {
            "description": "List of documents retrieved successfully",
            "model": List[DocumentResponse],
        }
    },
)
def list_all_documents(db: Session = Depends(get_db)):
    """
    Retrieve all documents that are not associated with any provider.
    """
    return get_all_documents(db)


@router.delete(
    "/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Document",
    description="Delete a document by its ID. This will also remove the file from storage.",
    responses={
        204: {"description": "Document deleted successfully"},
        404: {"description": "Document not found"},
    },
)
def delete_document_endpoint(doc_id: int, db: Session = Depends(get_db)):
    """
    Delete a document by its ID.

    - **doc_id**: The ID of the document to delete
    """
    success = delete_document(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return None
