from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field



# CRITERION RESULT


class AdmissionReviewCriterion(BaseModel):
    criterion: str
    status: Literal[
        "passed",
        "failed",
        "unclear",
        "not_applicable",
    ]
    evidence: str



# DOCUMENT FINDING


class AdmissionReviewDocument(BaseModel):
    document_id: int | None = None

    document_type: str
    filename: str
    required: bool

    verification_status: str

    verification_reason: str | None = None

    extracted_data: dict[str, Any] = Field(
        default_factory=dict
    )

    findings: list[str] = Field(
        default_factory=list
    )

# ADMISSION REVIEW RESPONSE


class AdmissionReviewResponse(BaseModel):

    admission_id: int

    student_id: int

    application_number: str

    recommendation: Literal[
        "eligible",
        "not_eligible",
        "manual_review",
    ]

    confidence: Literal[
        "low",
        "medium",
        "high",
    ]

    requires_manual_review: bool

    criteria: list[AdmissionReviewCriterion] = Field(
        default_factory=list
    )

    documents: list[AdmissionReviewDocument] = Field(
        default_factory=list
    )

    issues: list[str] = Field(
        default_factory=list
    )

    explanation: str

    criteria_source: str

    criteria_answer: str | None = None

    generated_at: datetime