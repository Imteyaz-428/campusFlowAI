from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ApplicantDashboardStudent(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    program: str
    department: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None


class ApplicantDashboardApplication(BaseModel):
    application_number: Optional[str] = None
    admission_number: Optional[str] = None
    roll_number: Optional[str] = None

    status: str
    eligibility_status: str
    eligibility_reason: Optional[str] = None
    admission_status: str


class ApplicantDashboardDocuments(BaseModel):
    required: int
    submitted: int
    missing: int
    verification_status: str


class ApplicantDashboardFees(BaseModel):
    total: Decimal
    paid: Decimal
    pending: Decimal
    mandatory_pending: bool


class ApplicantDashboardResponse(BaseModel):
    student: ApplicantDashboardStudent
    application: ApplicantDashboardApplication
    documents: ApplicantDashboardDocuments
    fees: ApplicantDashboardFees