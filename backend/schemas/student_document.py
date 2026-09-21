from typing import Any, Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field



# DOCUMENT TYPES


class StudentDocumentCreate(BaseModel):
    """
    Metadata required when a student document is uploaded.
    """

    document_type: str = Field(
        min_length=2,
        max_length=100,
        description=(
            "Type of document being submitted, for example "
            "aadhaar, marksheet, certificate, id_proof."
        ),
    )



# VERIFICATION RESPONSE


class StudentDocumentResponse(BaseModel):
    """
    Student document returned by the API.
    """

    id: int

    student_id: int

    organization_id: int

    document_type: str

    original_filename: str

    mime_type: Optional[str] = None

    file_size: Optional[int] = None

    verification_status: str

    extracted_data: Optional[dict[str, Any]] = None

    verification_reason: Optional[str] = None

    verified_by_user_id: Optional[int] = None

    # Database timestamps are datetime objects.
    uploaded_at: datetime

    processed_at: Optional[datetime] = None

    verified_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
    )



# VERIFICATION STATUS UPDATE


class StudentDocumentVerificationUpdate(BaseModel):
    """
    Staff/admin verification decision.

    This is intentionally separate from normal document metadata
    updates.
    """

    verification_status: str = Field(
        min_length=2,
        max_length=50,
        description=(
            "Verification result: verified, rejected, "
            "or review_required."
        ),
    )

    verification_reason: Optional[str] = Field(
        default=None,
        max_length=1000,
    )



# APPLICANT DOCUMENT STATUS


class ApplicantDocumentStatus(BaseModel):
    """
    Limited document information visible to the applicant.

    We intentionally do NOT expose:
        - extracted_data
        - internal reviewer information
        - database IDs
        - physical file paths
    """

    document_type: str

    original_filename: str

    verification_status: str

    verification_reason: Optional[str] = None



# APPLICANT STATUS


class ApplicantStatusResponse(BaseModel):
    """
    Application status visible using application number.

    This is intentionally a limited public-facing response.
    """

    application_number: str

    full_name: str

    program: str

    department: Optional[str] = None

    application_status: str

    admission_status: str

    documents: list[ApplicantDocumentStatus] = []