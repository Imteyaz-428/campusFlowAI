from fastapi import (
    UploadFile,
    File,
    Form,
    APIRouter,
    Depends,
    HTTPException,
    BackgroundTasks,
)
from pathlib import Path
import shutil
import uuid
from sqlalchemy.orm import Session

from models.document import Document
from models.user import User
from schemas.document import DocumentResponse

from crud.document import create_document

from core.dependencies import get_current_user
from dependencies.database import get_db
from services.background.document_processor import process_document
from crud.document import get_document_by_id, delete_document, get_documents

UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)



@router.post(
    "/upload",
    response_model=DocumentResponse,
)
def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB.",
        )

    if file.size == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty.",
        )

    extension = Path(file.filename).suffix

    stored_filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / stored_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        title=title,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=str(file_path),
        file_size=file.size,
        organization_id=current_user.organization_id,
        uploaded_by=current_user.id,
    )

    saved_document = create_document(
        db=db,
        document=document,
    )

    background_tasks.add_task(
        process_document,
        saved_document.id,
        str(file_path),
    )

    return saved_document




@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = get_document_by_id(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    if (
        document.organization_id
        != current_user.organization_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    return document


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_documents(
        db=db,
        organization_id=current_user.organization_id,
    )
    

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return document


@router.delete("/{document_id}")
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    delete_document(
        db=db,
        document=document,
    )

    return {
        "message": "Document deleted successfully"
    }