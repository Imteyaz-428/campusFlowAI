from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.student_document import StudentDocument
from models.student import Student

from schemas.student_document import (
    StudentDocumentCreate,
    StudentDocumentVerificationUpdate,
)



# STUDENT LOOKUP


def _get_student(
    db: Session,
    student_id: int,
    organization_id: int,
) -> Student:
    """
    Get a student belonging to the specified organization.
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



# CREATE DOCUMENT


def create_student_document(
    db: Session,
    student_id: int,
    organization_id: int,
    document_data: StudentDocumentCreate,
    original_filename: str,
    mime_type: str | None,
    file_size: int | None,
    file_path: str,
):
    """
    Create a StudentDocument record.

    The actual file should already be stored by the router/service.
    This function only creates the database record.
    """

  
    # VERIFY STUDENT
  

    _get_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

  
    # CREATE DOCUMENT
  

    document = StudentDocument(
        student_id=student_id,
        organization_id=organization_id,

        document_type=document_data.document_type.strip(),

        original_filename=original_filename,

        mime_type=mime_type,

        file_size=file_size,

        file_path=file_path,

        verification_status="uploaded",

        extracted_data=None,

        verification_reason=None,

        verified_by_user_id=None,
    )

    db.add(document)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create student document.",
        )

    db.refresh(document)

    return document



# GET DOCUMENT BY ID


def get_student_document(
    db: Session,
    document_id: int,
    organization_id: int,
):
    """
    Organization-scoped document lookup.
    """

    document = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.id == document_id,
            StudentDocument.organization_id == organization_id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student document not found.",
        )

    return document



# LIST STUDENT DOCUMENTS


def get_student_documents(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return all documents belonging to a student
    inside the current organization.
    """

  
    # VERIFY STUDENT
  

    _get_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

  
    # GET DOCUMENTS
  

    return (
        db.query(StudentDocument)
        .filter(
            StudentDocument.student_id == student_id,
            StudentDocument.organization_id == organization_id,
        )
        .order_by(
            StudentDocument.id.desc()
        )
        .all()
    )



# DELETE DOCUMENT


def delete_student_document(
    db: Session,
    document_id: int,
    organization_id: int,
):
    """
    Delete a student document database record.

    Physical file deletion will be handled separately by the
    storage layer/router.
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    db.delete(document)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to delete student document.",
        )

    return {
        "message": "Student document deleted successfully."
    }



# UPDATE VERIFICATION RESULT


def verify_student_document_record(
    db: Session,
    document_id: int,
    organization_id: int,
    verification_data: StudentDocumentVerificationUpdate,
    verified_by_user_id: int,
):
    """
    Human staff/admin verification decision.

    This is intentionally separate from AI processing.

    Allowed final decisions:

        verified
        rejected
        review_required
    """

    document = get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    verification_status = (
        verification_data.verification_status
        .strip()
        .lower()
    )

    allowed_statuses = {
        "verified",
        "rejected",
        "review_required",
    }

    if verification_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid verification status. "
                "Allowed values: verified, rejected, "
                "review_required."
            ),
        )

    document.verification_status = verification_status

    document.verification_reason = (
        verification_data.verification_reason.strip()
        if verification_data.verification_reason
        else None
    )

    document.verified_by_user_id = verified_by_user_id

    # Import here to keep the module clean at startup.
    from datetime import datetime

    document.verified_at = datetime.utcnow()

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to save document verification decision.",
        )

    db.refresh(document)

    return document



# GET DOCUMENTS BY STATUS


def get_documents_by_status(
    db: Session,
    organization_id: int,
    verification_status: str,
):
    """
    Return documents with a specific verification status.

    Useful for staff verification queues.
    """

    return (
        db.query(StudentDocument)
        .filter(
            StudentDocument.organization_id == organization_id,
            StudentDocument.verification_status
            == verification_status.strip().lower(),
        )
        .order_by(
            StudentDocument.id.asc()
        )
        .all()
    )