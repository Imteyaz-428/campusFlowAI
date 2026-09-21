from pathlib import Path
import shutil
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    UploadFile,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import (
    require_role,
    UserRole,
)

from dependencies.database import get_db

from models.document import Document
from models.user import User

from schemas.document import DocumentResponse

from crud.document import (
    create_document,
    get_documents,
    get_accessible_document,
    delete_document,
)

from services.background.document_processor import (
    process_document,
)



# CONFIGURATION


UPLOAD_DIR = Path(
    "uploads/documents"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

MAX_FILE_SIZE = 10 * 1024 * 1024



# ROUTER


router = APIRouter(
    prefix="/admin/knowledge",
    tags=["Admin Knowledge Base"],
)



# GET KNOWLEDGE DOCUMENTS


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_knowledge_documents(
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Return all organization documents used as
    college knowledge.

    Admin only.
    """

    return get_documents(
        db=db,
        organization_id=current_admin.organization_id,
    )



# UPLOAD KNOWLEDGE DOCUMENT


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_knowledge_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Upload an official college knowledge document.

    The existing CampusFlow document processor is reused so
    the document enters the same RAG pipeline:

        PDF
          ↓
        extraction
          ↓
        chunking
          ↓
        embeddings
          ↓
        vector storage
    """

  
    # VALIDATE FILE
  

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

  
    # READ FILE
  

    file_content = file.file.read()

    file_size = len(file_content)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty.",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size must not exceed 10 MB.",
        )

  
    # TITLE
  

    title = Path(
        file.filename
    ).stem

  
    # STORED FILE NAME
  

    extension = Path(
        file.filename
    ).suffix.lower()

    stored_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR /
        stored_filename
    )

  
    # SAVE FILE
  

    try:

        with open(
            file_path,
            "wb",
        ) as buffer:

            buffer.write(
                file_content
            )

    except Exception as exc:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to save the uploaded document."
            ),
        ) from exc

  
    # CREATE DATABASE RECORD
  

    document = Document(
        title=title,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=str(file_path),
        file_size=file_size,
        organization_id=(
            current_admin.organization_id
        ),
        uploaded_by=current_admin.id,
        status="processing",
    )

    try:

        saved_document = create_document(
            db=db,
            document=document,
        )

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise

  
    # START RAG PROCESSING
  

    background_tasks.add_task(
        process_document,
        saved_document.id,
        str(file_path),
    )

    return saved_document



# DELETE KNOWLEDGE DOCUMENT


@router.delete(
    "/{document_id}",
)
def remove_knowledge_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Delete a college knowledge document.

    The document's chunks are deleted through the
    Document relationship cascade.
    """

    document = get_accessible_document(
        db=db,
        document_id=document_id,
        organization_id=(
            current_admin.organization_id
        ),
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

  
    # KEEP FILE PATH BEFORE DATABASE DELETE
  

    file_path = None

    if document.file_path:
        file_path = Path(
            document.file_path
        )

  
    # DELETE DATABASE RECORD
  

    delete_document(
        db=db,
        document=document,
    )

  
    # DELETE PHYSICAL FILE
  

    if file_path and file_path.exists():

        try:
            file_path.unlink()
        except OSError:
            pass

    return {
        "message": (
            "College knowledge document "
            "deleted successfully."
        )
    }