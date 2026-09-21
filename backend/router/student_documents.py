from pathlib import Path
from uuid import uuid4
from fastapi.responses import FileResponse
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from core.dependencies import (
    get_current_admin,
    get_current_applicant,
    get_current_staff,
    get_current_student,
)

from dependencies.database import get_db

from models.organization import Organization
from models.student import Student
from models.user import User

from schemas.student_document import (
    ApplicantDocumentStatus,
    ApplicantStatusResponse,
    StudentDocumentCreate,
    StudentDocumentResponse,
    StudentDocumentVerificationUpdate,
)

from crud.student_document import (
    create_student_document,
    get_student_document,
    get_student_documents,
    delete_student_document,
    verify_student_document_record,
    get_documents_by_status,
)

from services.campus.student_service import (
    get_student_by_application_number_service,
)

from services.campus.document_processing_service import (
    process_student_document_service,
)



# ROUTER


router = APIRouter(
    prefix="/campus/documents",
    tags=["Student Documents"],
)



# STORAGE CONFIGURATION


UPLOAD_DIRECTORY = Path("uploads/student_documents")

UPLOAD_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True,
)


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
}


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB



# ORGANIZATION LOOKUP


def _get_organization_by_slug(
    db: Session,
    organization_slug: str,
) -> Organization:
    """
    Resolve an organization using its public slug.

    Organization slug is used together with the application number
    so that application numbers remain isolated between colleges.
    """

    normalized_slug = organization_slug.strip().lower()

    organization = (
        db.query(Organization)
        .filter(
            Organization.slug == normalized_slug,
        )
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="College not found.",
        )

    return organization



# APPLICANT LOOKUP


def _get_applicant(
    db: Session,
    organization_slug: str,
    application_number: str,
) -> Student:
    """
    Resolve an applicant using BOTH:

        organization_slug
        application_number

    This is critical because application numbers are unique only
    within an organization.

    Example:

        Org A → APP-2026-00001
        Org B → APP-2026-00001

    These are two different applicants.
    """

    organization = _get_organization_by_slug(
        db=db,
        organization_slug=organization_slug,
    )

    return get_student_by_application_number_service(
        db=db,
        application_number=application_number,
        organization_id=organization.id,
    )



# STUDENT LOOKUP


def _get_student(
    db: Session,
    student_id: int,
    organization_id: int,
) -> Student:
    """
    Organization-scoped student lookup.
    """

    student = (
        db.query(Student)
        .filter(
            Student.id == student_id,
            Student.organization_id == organization_id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    return student



# STUDENT OWNERSHIP CHECK


def _verify_student_owns_profile(
    student: Student,
    current_user: User,
):
    """
    Ensure an authenticated student can only
    access their own profile/documents.
    """

    if student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own student documents.",
        )



# APPLICANT — GET APPLICATION STATUS


@router.get(
    "/applicant/{organization_slug}/{application_number}/status",
    response_model=ApplicantStatusResponse,
)
def get_applicant_status(
    organization_slug: str,
    application_number: str,
    db: Session = Depends(get_db),
):
    """
    Allow a pre-admission applicant to check:

        - application number
        - name
        - program
        - department
        - application status
        - admission status
        - document verification status

    Organization and application number are BOTH required.

    Example:

        GET
        /campus/documents/applicant/gcet/APP-2026-00001/status
    """

    student = _get_applicant(
        db=db,
        organization_slug=organization_slug,
        application_number=application_number,
    )

    documents = get_student_documents(
        db=db,
        student_id=student.id,
        organization_id=student.organization_id,
    )

    document_statuses = [
        ApplicantDocumentStatus(
            document_type=document.document_type,
            original_filename=document.original_filename,
            verification_status=document.verification_status,
            verification_reason=document.verification_reason,
        )
        for document in documents
    ]

    return ApplicantStatusResponse(
        application_number=student.application_number,
        full_name=student.full_name,
        program=student.program,
        department=student.department,
        application_status=student.status,
        admission_status=student.admission_status,
        documents=document_statuses,
    )



# APPLICANT — GET DOCUMENTS


@router.get(
    "/applicant/{organization_slug}/{application_number}/documents",
    response_model=list[ApplicantDocumentStatus],
)
def get_applicant_documents(
    organization_slug: str,
    application_number: str,
    db: Session = Depends(get_db),
):
    """
    Return limited document information to the applicant.

    Organization-scoped.

    Internal information is NOT exposed:

        - document ID
        - physical file path
        - extracted data
        - reviewer ID
    """

    student = _get_applicant(
        db=db,
        organization_slug=organization_slug,
        application_number=application_number,
    )

    documents = get_student_documents(
        db=db,
        student_id=student.id,
        organization_id=student.organization_id,
    )

    return [
        ApplicantDocumentStatus(
            document_type=document.document_type,
            original_filename=document.original_filename,
            verification_status=document.verification_status,
            verification_reason=document.verification_reason,
        )
        for document in documents
    ]



# APPLICANT — UPLOAD DOCUMENT


@router.post(
    "/applicant/{organization_slug}/{application_number}/upload",
    response_model=ApplicantDocumentStatus,
    status_code=status.HTTP_201_CREATED,
)
async def upload_applicant_document(
    organization_slug: str,
    application_number: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a document for a pre-admission applicant.

    Organization + application number are required.

    Example:

        POST
        /campus/documents/applicant/gcet/APP-2026-00001/upload
    """

    # ------------------------------------------------------------
    # FIND APPLICATION — ORGANIZATION SCOPED
    # ------------------------------------------------------------

    student = _get_applicant(
        db=db,
        organization_slug=organization_slug,
        application_number=application_number,
    )

    # ------------------------------------------------------------
    # CHECK APPLICATION STATE
    # ------------------------------------------------------------

    if student.admission_status == "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Admission is already confirmed. "
                "Use the authenticated student portal."
            ),
        )

    if student.status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Documents cannot be uploaded "
                "for a rejected application."
            ),
        )

    # ------------------------------------------------------------
    # VALIDATE DOCUMENT TYPE
    # ------------------------------------------------------------

    document_type = document_type.strip()

    if len(document_type) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type is required.",
        )

    # ------------------------------------------------------------
    # VALIDATE MIME TYPE
    # ------------------------------------------------------------

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file type. "
                "Only PDF, JPG, JPEG, and PNG files are allowed."
            ),
        )

    # ------------------------------------------------------------
    # READ FILE
    # ------------------------------------------------------------

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ------------------------------------------------------------
    # FILE SIZE
    # ------------------------------------------------------------

    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size cannot exceed 10 MB.",
        )

    # ------------------------------------------------------------
    # SAFE FILE EXTENSION
    # ------------------------------------------------------------

    original_filename = file.filename or "document"

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension.",
        )

    # ------------------------------------------------------------
    # GENERATE UNIQUE STORAGE NAME
    # ------------------------------------------------------------

    stored_filename = (
        f"{uuid4().hex}{extension}"
    )

    # IMPORTANT:
    #
    # Physical storage is also organization-scoped:
    #
    # uploads/
    #   student_documents/
    #       organization_id/
    #           student_id/
    #

    student_directory = (
        UPLOAD_DIRECTORY
        / str(student.organization_id)
        / str(student.id)
    )

    student_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = (
        student_directory
        / stored_filename
    )

    # ------------------------------------------------------------
    # SAVE FILE
    # ------------------------------------------------------------

    try:

        file_path.write_bytes(
            file_content
        )

    except OSError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded document.",
        ) from exc

    # ------------------------------------------------------------
    # CREATE DATABASE RECORD
    # ------------------------------------------------------------

    try:

        document = create_student_document(
            db=db,
            student_id=student.id,
            organization_id=student.organization_id,
            document_data=StudentDocumentCreate(
                document_type=document_type,
            ),
            original_filename=original_filename,
            mime_type=file.content_type,
            file_size=file_size,
            file_path=str(file_path),
        )

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise

    # ------------------------------------------------------------
    # LIMITED RESPONSE
    # ------------------------------------------------------------

    return ApplicantDocumentStatus(
        document_type=document.document_type,
        original_filename=document.original_filename,
        verification_status=document.verification_status,
        verification_reason=document.verification_reason,
    )



# AUTHENTICATED STUDENT — UPLOAD DOCUMENT


@router.post(
    "/students/{student_id}/upload",
    response_model=StudentDocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_student_document(
    student_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Upload a document for an authenticated student.

    Used after the student account has been activated.
    """

    student = _get_student(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )

    _verify_student_owns_profile(
        student=student,
        current_user=current_user,
    )

    document_type = document_type.strip()

    if len(document_type) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type is required.",
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file type. "
                "Only PDF, JPG, JPEG, and PNG files are allowed."
            ),
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size cannot exceed 10 MB.",
        )

    original_filename = file.filename or "document"

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension.",
        )

    stored_filename = (
        f"{uuid4().hex}{extension}"
    )

    student_directory = (
        UPLOAD_DIRECTORY
        / str(current_user.organization_id)
        / str(student_id)
    )

    student_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = (
        student_directory
        / stored_filename
    )

    try:

        file_path.write_bytes(
            file_content
        )

    except OSError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded document.",
        ) from exc

    try:

        document = create_student_document(
            db=db,
            student_id=student_id,
            organization_id=current_user.organization_id,
            document_data=StudentDocumentCreate(
                document_type=document_type,
            ),
            original_filename=original_filename,
            mime_type=file.content_type,
            file_size=file_size,
            file_path=str(file_path),
        )

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise

    return document


# STAFF — VIEW ORIGINAL DOCUMENT FILE


@router.get(
    "/{document_id}/file",
)
def view_document_file(
    document_id: int,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can view the original uploaded document.

    Security:
        - Authentication required
        - Staff role required
        - Organization isolation enforced
        - Physical file path is never exposed
        - File must remain inside UPLOAD_DIRECTORY

    Supports:
        PDF
        JPG
        JPEG
        PNG
    """

    # ------------------------------------------------------------
    # GET DOCUMENT — ORGANIZATION SCOPED
    # ------------------------------------------------------------

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    # ------------------------------------------------------------
    # RESOLVE PATH
    # ------------------------------------------------------------

    try:

        upload_root = (
            UPLOAD_DIRECTORY
            .resolve()
        )

        file_path = (
            Path(document.file_path)
            .resolve()
        )

    except OSError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to resolve document path.",
        ) from exc

    # ------------------------------------------------------------
    # SECURITY CHECK
    # ------------------------------------------------------------

    try:

        file_path.relative_to(
            upload_root
        )

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid document storage path.",
        )

    # ------------------------------------------------------------
    # FILE EXISTS
    # ------------------------------------------------------------

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found.",
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file is invalid.",
        )

    # ------------------------------------------------------------
    # RETURN FILE INLINE
    # ------------------------------------------------------------

    return FileResponse(
        path=str(file_path),
        media_type=(
            document.mime_type
            or "application/octet-stream"
        ),
        filename=document.original_filename,
        content_disposition_type="inline",
    )

# AUTHENTICATED STUDENT — MY DOCUMENTS


@router.get(
    "/students/{student_id}",
    response_model=list[StudentDocumentResponse],
)
def get_my_documents(
    student_id: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Return documents belonging to the authenticated student.
    """

    student = _get_student(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )

    _verify_student_owns_profile(
        student=student,
        current_user=current_user,
    )

    return get_student_documents(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )



# STAFF — GET STUDENT DOCUMENTS


@router.get(
    "/students/{student_id}/all",
    response_model=list[StudentDocumentResponse],
)
def get_student_documents_staff(
    student_id: int,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can view documents belonging to a student.

    Organization isolation is enforced.
    """

    _get_student(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )

    return get_student_documents(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


# APPLICANT — MY DOCUMENTS


@router.get(
    "/me",
    response_model=list[ApplicantDocumentStatus],
)
def get_my_applicant_documents(
    current_applicant: Student = Depends(
        get_current_applicant
    ),
    db: Session = Depends(get_db),
):
    """
    Return documents belonging to the authenticated applicant.

    The applicant does NOT provide:

        student_id
        organization_id
        application_number

    All identity information comes from the applicant JWT.
    """

    documents = get_student_documents(
        db=db,
        student_id=current_applicant.id,
        organization_id=current_applicant.organization_id,
    )

    return [
        ApplicantDocumentStatus(
            document_type=document.document_type,
            original_filename=document.original_filename,
            verification_status=document.verification_status,
            verification_reason=document.verification_reason,
        )
        for document in documents
    ]
    

# APPLICANT — UPLOAD MY DOCUMENT


@router.post(
    "/me/upload",
    response_model=ApplicantDocumentStatus,
    status_code=status.HTTP_201_CREATED,
)
async def upload_my_applicant_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_applicant: Student = Depends(
        get_current_applicant
    ),
    db: Session = Depends(get_db),
):
    """
    Upload a document for the authenticated applicant.

    IMPORTANT:

    student_id is NEVER accepted from the frontend.

    The student is resolved from:

        JWT
        ↓
        get_current_applicant()
        ↓
        Student
    """

    student = current_applicant

    # ------------------------------------------------------------
    # APPLICATION STATE
    # ------------------------------------------------------------

    if student.admission_status == "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Admission is already confirmed. "
                "Use the authenticated student portal."
            ),
        )

    if student.status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Documents cannot be uploaded "
                "for a rejected application."
            ),
        )

    # ------------------------------------------------------------
    # DOCUMENT TYPE
    # ------------------------------------------------------------

    document_type = document_type.strip()

    if len(document_type) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type is required.",
        )

    # ------------------------------------------------------------
    # MIME TYPE
    # ------------------------------------------------------------

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file type. "
                "Only PDF, JPG, JPEG, and PNG files are allowed."
            ),
        )

    # ------------------------------------------------------------
    # READ FILE
    # ------------------------------------------------------------

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ------------------------------------------------------------
    # FILE SIZE
    # ------------------------------------------------------------

    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size cannot exceed 10 MB.",
        )

    # ------------------------------------------------------------
    # FILE NAME / EXTENSION
    # ------------------------------------------------------------

    original_filename = file.filename or "document"

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension.",
        )

    # ------------------------------------------------------------
    # UNIQUE STORAGE NAME
    # ------------------------------------------------------------

    stored_filename = f"{uuid4().hex}{extension}"

    student_directory = (
        UPLOAD_DIRECTORY
        / str(student.organization_id)
        / str(student.id)
    )

    student_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = (
        student_directory
        / stored_filename
    )

    # ------------------------------------------------------------
    # SAVE FILE
    # ------------------------------------------------------------

    try:

        file_path.write_bytes(
            file_content
        )

    except OSError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded document.",
        ) from exc

    # ------------------------------------------------------------
    # DATABASE RECORD
    # ------------------------------------------------------------

    try:

        document = create_student_document(
            db=db,
            student_id=student.id,
            organization_id=student.organization_id,
            document_data=StudentDocumentCreate(
                document_type=document_type,
            ),
            original_filename=original_filename,
            mime_type=file.content_type,
            file_size=file_size,
            file_path=str(file_path),
        )

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise

    # ------------------------------------------------------------
    # LIMITED APPLICANT RESPONSE
    # ------------------------------------------------------------

    return ApplicantDocumentStatus(
        document_type=document.document_type,
        original_filename=document.original_filename,
        verification_status=document.verification_status,
        verification_reason=document.verification_reason,
    )
    
@router.get(
    "/queue/{verification_status}",
    response_model=list[StudentDocumentResponse],
)
def get_verification_queue(
    verification_status: str,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can view the document verification queue.
    """

    allowed_statuses = {
        "uploaded",
        "processing",
        "verified",
        "rejected",
        "review_required",
    }

    verification_status = (
        verification_status.strip().lower()
    )

    if verification_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid verification status. "
                "Allowed values: uploaded, processing, "
                "verified, rejected, review_required."
            ),
        )

    return get_documents_by_status(
        db=db,
        organization_id=current_user.organization_id,
        verification_status=verification_status,
    )


# STAFF — GET SINGLE DOCUMENT


@router.get(
    "/{document_id}",
    response_model=StudentDocumentResponse,
)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can view a specific document.

    The CRUD layer MUST scope this lookup to the current
    organization.
    """

    return get_student_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )



# STAFF — AI PROCESS DOCUMENT


@router.post(
    "/{document_id}/process",
    response_model=StudentDocumentResponse,
)
def process_document(
    document_id: int,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can run the AI document verification pipeline.
    """

    result = process_student_document_service(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    return result["document"]



# STAFF — MANUAL VERIFICATION


@router.put(
    "/{document_id}/verify",
    response_model=StudentDocumentResponse,
)
def verify_document(
    document_id: int,
    verification_data: StudentDocumentVerificationUpdate,
    current_user: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
):
    """
    ADMIN or TEACHER can manually verify a document.

    Allowed:

        verified
        rejected
        review_required
    """

    return verify_student_document_record(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
        verification_data=verification_data,
        verified_by_user_id=current_user.id,
    )



# STAFF — VERIFICATION QUEUE





# ADMIN — DELETE DOCUMENT


@router.delete(
    "/{document_id}",
)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    ADMIN-only document deletion.

    Organization isolation is enforced.
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    file_path = Path(
        document.file_path
    )

    result = delete_student_document(
        db=db,
        document_id=document_id,
        organization_id=current_user.organization_id,
    )

    try:

        if file_path.exists():
            file_path.unlink()

    except OSError:
        pass

    return result