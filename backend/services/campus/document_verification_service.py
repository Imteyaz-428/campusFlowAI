from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud.student_document import (
    create_student_document,
    get_student_document,
    get_student_documents,
    update_document_verification,
)

from models.student import Student
from models.student_document import StudentDocument

from schemas.student_document import (
    StudentDocumentVerificationUpdate,
)



# CONSTANTS


VERIFICATION_STATUS_UPLOADED = "uploaded"
VERIFICATION_STATUS_PROCESSING = "processing"
VERIFICATION_STATUS_VERIFIED = "verified"
VERIFICATION_STATUS_REJECTED = "rejected"
VERIFICATION_STATUS_REVIEW_REQUIRED = "review_required"


ALLOWED_DOCUMENT_TYPES = {
    "aadhaar",
    "id_proof",
    "marksheet",
    "10th_marksheet",
    "12th_marksheet",
    "certificate",
    "transfer_certificate",
    "migration_certificate",
    "photo",
    "other",
}



# STUDENT VALIDATION


def _get_student(
    db: Session,
    student_id: int,
    organization_id: int,
) -> Student:
    """
    Get a student belonging to the current organization.
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



# DOCUMENT TYPE VALIDATION


def _validate_document_type(
    document_type: str,
) -> str:
    """
    Normalize and validate the submitted document type.
    """

    normalized_type = (
        str(document_type)
        .strip()
        .lower()
    )

    if not normalized_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type is required.",
        )

    if normalized_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported document type. "
                "Please provide a supported student document type."
            ),
        )

    return normalized_type



# UPLOAD DOCUMENT


def upload_student_document_service(
    db: Session,
    student_id: int,
    organization_id: int,
    document_type: str,
    file,
):
    """
    Upload a document for a student.

    Initial state:

        uploaded

    OCR and AI verification are performed by later processing
    stages.
    """


    # VALIDATE STUDENT


    _get_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )


    # VALIDATE DOCUMENT TYPE


    normalized_type = _validate_document_type(
        document_type
    )


    # CREATE DOCUMENT


    document = create_student_document(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
        document_type=normalized_type,
        file=file,
    )

    return document



# LIST DOCUMENTS


def list_student_documents_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return all documents belonging to a student.
    """

    return get_student_documents(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# GET DOCUMENT


def get_student_document_service(
    db: Session,
    document_id: int,
    organization_id: int,
):
    """
    Get one student document.
    """

    return get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )



# START VERIFICATION


def start_document_verification_service(
    db: Session,
    document_id: int,
    organization_id: int,
):
    """
    Move an uploaded document into the processing state.

    This function does not perform OCR or AI verification yet.

    Later:

        processing
             ↓
        classification
             ↓
        OCR
             ↓
        field extraction
             ↓
        comparison
             ↓
        verification decision
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    if document.verification_status not in {
        VERIFICATION_STATUS_UPLOADED,
        VERIFICATION_STATUS_REVIEW_REQUIRED,
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Document cannot enter processing from its "
                "current verification state."
            ),
        )

    document.verification_status = (
        VERIFICATION_STATUS_PROCESSING
    )

    document.processed_at = None
    document.verification_reason = None

    db.commit()
    db.refresh(document)

    return document



# APPLY VERIFICATION RESULT


def apply_verification_result_service(
    db: Session,
    document_id: int,
    organization_id: int,
    verification_status: str,
    verification_reason: str | None = None,
    extracted_data: dict[str, Any] | None = None,
):
    """
    Apply the result produced by the verification engine.

    This function will later be called by the OCR/AI verification
    pipeline.

    It does NOT itself claim to perform AI verification.
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    normalized_status = (
        str(verification_status)
        .strip()
        .lower()
    )

    allowed_statuses = {
        VERIFICATION_STATUS_VERIFIED,
        VERIFICATION_STATUS_REJECTED,
        VERIFICATION_STATUS_REVIEW_REQUIRED,
    }

    if normalized_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid verification status. "
                "Allowed values: verified, rejected, "
                "review_required."
            ),
        )


    # UPDATE EXTRACTED DATA


    if extracted_data is not None:
        document.extracted_data = extracted_data


    # UPDATE STATUS


    document.verification_status = (
        normalized_status
    )

    document.verification_reason = (
        verification_reason
    )

    document.processed_at = datetime.utcnow()

    if normalized_status in {
        VERIFICATION_STATUS_VERIFIED,
        VERIFICATION_STATUS_REJECTED,
    }:
        document.verified_at = datetime.utcnow()

    else:
        document.verified_at = None

    db.commit()
    db.refresh(document)

    return document



# STAFF VERIFICATION


def verify_document_manually_service(
    db: Session,
    document_id: int,
    organization_id: int,
    verified_by_user_id: int,
    verification_data: StudentDocumentVerificationUpdate,
):
    """
    Allow an authorized staff member to manually verify a document.

    This is the human-review fallback for cases where automated
    verification cannot safely make a decision.
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    return update_document_verification(
        db=db,
        document_id=document.id,
        organization_id=organization_id,
        verification_data=verification_data,
        verified_by_user_id=verified_by_user_id,
    )