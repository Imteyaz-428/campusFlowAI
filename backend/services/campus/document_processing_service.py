from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud.student_document import (
    get_student_document,
)

from models.student import Student
from models.student_document import StudentDocument

from services.campus.document_ai_service import (
    DocumentAIExtractionError,
    extract_document_fields,
)

from services.campus.document_extraction_service import (
    DocumentExtractionError,
    extract_document_text,
)

from services.campus.document_verification_engine import (
    verify_student_document,
)



# VERIFICATION STATUS


VERIFICATION_STATUS_PROCESSING = "processing"
VERIFICATION_STATUS_VERIFIED = "verified"
VERIFICATION_STATUS_REJECTED = "rejected"
VERIFICATION_STATUS_REVIEW_REQUIRED = "review_required"



# STUDENT LOOKUP


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



# DOCUMENT LOOKUP


def _get_document(
    db: Session,
    document_id: int,
    organization_id: int,
) -> StudentDocument:
    """
    Get a document belonging to the current organization.
    """

    return get_student_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )



# SET PROCESSING STATUS


def _set_processing(
    db: Session,
    document: StudentDocument,
):
    """
    Mark a document as currently being processed.
    """

    document.verification_status = (
        VERIFICATION_STATUS_PROCESSING
    )

    document.verification_reason = None

    document.processed_at = None

    document.verified_at = None

    db.commit()
    db.refresh(document)

    return document



# SET FAILURE / REVIEW REQUIRED


def _set_review_required(
    db: Session,
    document: StudentDocument,
    reason: str,
):
    """
    Put a document into human-review state when the automated
    pipeline cannot safely complete verification.
    """

    document.verification_status = (
        VERIFICATION_STATUS_REVIEW_REQUIRED
    )

    document.verification_reason = reason

    document.processed_at = datetime.utcnow()

    document.verified_at = None

    db.commit()
    db.refresh(document)

    return document



# PROCESS DOCUMENT


def process_student_document_service(
    db: Session,
    document_id: int,
    organization_id: int,
):
    """
    Run the complete Phase 2 document-processing pipeline.

    Pipeline:

        StudentDocument
              ↓
        File extraction / OCR
              ↓
        AI field extraction
              ↓
        Deterministic verification
              ↓
        Save result
              ↓
        VERIFIED / REJECTED / REVIEW_REQUIRED
    """

    # ------------------------------------------------------------
    # GET DOCUMENT
    # ------------------------------------------------------------

    document = _get_document(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # GET STUDENT
    # ------------------------------------------------------------

    student = _get_student(
        db=db,
        student_id=document.student_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # VALIDATE CURRENT STATE
    # ------------------------------------------------------------

    allowed_start_states = {
        "uploaded",
        "review_required",
    }

    if document.verification_status not in allowed_start_states:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Document cannot be processed from its current "
                f"state: {document.verification_status}."
            ),
        )

    # ------------------------------------------------------------
    # MARK PROCESSING
    # ------------------------------------------------------------

    _set_processing(
        db=db,
        document=document,
    )

    # ============================================================
    # STEP 1 — TEXT EXTRACTION / OCR
    # ============================================================

    try:

        extracted_text = extract_document_text(
            file_path=document.file_path,
            mime_type=document.mime_type,
        )

    except DocumentExtractionError as exc:

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "Automatic text extraction failed. "
                f"Human review required. Details: {exc}"
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "Unexpected error occurred during document "
                f"extraction. Human review required. Details: {exc}"
            ),
        )

    # ------------------------------------------------------------
    # EMPTY OCR RESULT
    # ------------------------------------------------------------

    if not extracted_text.strip():

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "No readable text could be extracted from "
                "the document."
            ),
        )

    # ------------------------------------------------------------
    # SAVE RAW EXTRACTED TEXT
    # ------------------------------------------------------------

    document.extracted_text = extracted_text

    db.commit()
    db.refresh(document)

    # ============================================================
    # STEP 2 — AI FIELD EXTRACTION
    # ============================================================

    try:

        extracted_data = extract_document_fields(
            document_type=document.document_type,
            extracted_text=extracted_text,
        )

    except DocumentAIExtractionError as exc:

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "AI could not reliably extract structured "
                f"information from the document. Details: {exc}"
            ),
        )

    except Exception as exc:

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "Unexpected error occurred during AI field "
                f"extraction. Human review required. Details: {exc}"
            ),
        )

    # ------------------------------------------------------------
    # EMPTY AI RESULT
    # ------------------------------------------------------------

    if not extracted_data:

        return _set_review_required(
            db=db,
            document=document,
            reason=(
                "AI extraction completed but no structured "
                "information was returned."
            ),
        )

    # ============================================================
    # STEP 3 — DETERMINISTIC VERIFICATION
    # ============================================================

    verification_result = verify_student_document(
        student=student,
        extracted_data=extracted_data,
    )

    # ============================================================
    # STEP 4 — SAVE VERIFICATION RESULT
    # ============================================================

    verification_status = verification_result[
        "verification_status"
    ]

    verification_reason = verification_result[
        "verification_reason"
    ]

    document.extracted_data = extracted_data

    document.verification_status = (
        verification_status
    )

    document.verification_reason = (
        verification_reason
    )

    document.processed_at = datetime.utcnow()

    # AI verification does not represent a human approval.
    #
    # Therefore:
    #
    # verified_by_user_id = NULL
    #
    # Human verification will populate this later.

    document.verified_by_user_id = None

    if verification_status in {
        VERIFICATION_STATUS_VERIFIED,
        VERIFICATION_STATUS_REJECTED,
    }:

        document.verified_at = datetime.utcnow()

    else:

        document.verified_at = None

    # ============================================================
    # SAVE
    # ============================================================

    try:

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to save document verification result."
            ),
        ) from exc

    db.refresh(document)

    # ============================================================
    # RETURN COMPLETE RESULT
    # ============================================================

    return {
        "document": document,
        "verification": verification_result,
    }



# PROCESS MULTIPLE DOCUMENTS


def process_student_documents_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Process all uploaded/review-required documents belonging
    to a student.

    This is useful later for automated onboarding/admission
    workflows.
    """

    student = _get_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    documents = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.student_id == student.id,
            StudentDocument.organization_id == organization_id,
            StudentDocument.verification_status.in_(
                [
                    "uploaded",
                    "review_required",
                ]
            ),
        )
        .order_by(
            StudentDocument.id.asc()
        )
        .all()
    )

    results: list[Any] = []

    for document in documents:

        result = process_student_document_service(
            db=db,
            document_id=document.id,
            organization_id=organization_id,
        )

        results.append(result)

    return results