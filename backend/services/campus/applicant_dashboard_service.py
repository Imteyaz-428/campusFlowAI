from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.student import Student
from models.admission import Admission
from models.student_document import StudentDocument
from models.fee import Fee



# REQUIRED DOCUMENTS

#
# These are the mandatory documents for the applicant portal.
#
# Keep institutional policy questions in RAG.
# This list is only used to calculate dashboard progress.
#


REQUIRED_DOCUMENT_TYPES = {
    "10th_marksheet",
    "12th_marksheet",
    "id_proof",
    "photo",
    "transfer_certificate",
}



# APPLICANT DASHBOARD


def get_applicant_dashboard_service(
    db: Session,
    student: Student,
):
    """
    Build the dashboard for the authenticated applicant.

    IMPORTANT:

        The Student object comes from get_current_applicant().

    Therefore:

        student_id
        organization_id

    are trusted server-side values.

    The frontend cannot choose another student's ID.
    """

    # ------------------------------------------------------------
    # ORGANIZATION
    # ------------------------------------------------------------

    organization_id = student.organization_id

    # ------------------------------------------------------------
    # ADMISSION
    # ------------------------------------------------------------

    admission = (
        db.query(Admission)
        .filter(
            Admission.student_id == student.id,
            Admission.organization_id == organization_id,
        )
        .order_by(
            Admission.id.desc()
        )
        .first()
    )

    if admission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission record not found.",
        )

    # ------------------------------------------------------------
    # DOCUMENTS
    # ------------------------------------------------------------

    documents = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.student_id == student.id,
            StudentDocument.organization_id == organization_id,
        )
        .all()
    )

    # Count each required document type once.
    submitted_document_types = {
        document.document_type
        for document in documents
        if document.document_type in REQUIRED_DOCUMENT_TYPES
    }

    required_document_count = len(
        REQUIRED_DOCUMENT_TYPES
    )

    submitted_document_count = len(
        submitted_document_types
    )

    missing_document_count = (
        required_document_count
        - submitted_document_count
    )

    # ------------------------------------------------------------
    # DOCUMENT VERIFICATION STATUS
    # ------------------------------------------------------------

    if not documents:
        document_verification_status = "not_started"

    elif missing_document_count > 0:
        document_verification_status = "incomplete"

    else:
        verification_statuses = {
            document.verification_status
            for document in documents
        }

        if "rejected" in verification_statuses:
            document_verification_status = "rejected"

        elif "review_required" in verification_statuses:
            document_verification_status = "review_required"

        elif "processing" in verification_statuses:
            document_verification_status = "processing"

        elif all(
            document.verification_status == "verified"
            for document in documents
            if document.document_type in REQUIRED_DOCUMENT_TYPES
        ):
            document_verification_status = "verified"

        else:
            document_verification_status = "pending"

    # ------------------------------------------------------------
    # FEES
    # ------------------------------------------------------------

    fees = (
        db.query(Fee)
        .filter(
            Fee.student_id == student.id,
            Fee.organization_id == organization_id,
        )
        .all()
    )

    total_fee = sum(
        (
            Decimal(str(fee.amount))
            for fee in fees
        ),
        Decimal("0.00"),
    )

    paid_fee = sum(
        (
            Decimal(str(fee.amount))
            for fee in fees
            if fee.status == "paid"
        ),
        Decimal("0.00"),
    )

    pending_fee = (
        total_fee - paid_fee
    )

    mandatory_pending = any(
        fee.is_mandatory == "true"
        and fee.status != "paid"
        and fee.status != "waived"
        for fee in fees
    )

    # ------------------------------------------------------------
    # APPLICATION
    # ------------------------------------------------------------

    application_status = (
        admission.status
    )

    eligibility_status = (
        admission.eligibility_status
    )

    # ------------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------------

    return {
        "student": {
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "program": student.program,
            "department": student.department,
            "academic_year": student.academic_year,
            "semester": student.semester,
        },

        "application": {
            "application_number": (
                student.application_number
            ),
            "admission_number": (
                student.admission_number
            ),
            "roll_number": (
                student.roll_number
            ),
            "status": application_status,
            "eligibility_status": eligibility_status,
            "eligibility_reason": (
                admission.eligibility_reason
            ),
            "admission_status": (
                student.admission_status
            ),
        },

        "documents": {
            "required": required_document_count,
            "submitted": submitted_document_count,
            "missing": missing_document_count,
            "verification_status": (
                document_verification_status
            ),
        },

        "fees": {
            "total": total_fee,
            "paid": paid_fee,
            "pending": pending_fee,
            "mandatory_pending": mandatory_pending,
        },
    }