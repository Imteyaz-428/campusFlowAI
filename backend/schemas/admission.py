from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field



# CREATE ADMISSION


class AdmissionCreate(BaseModel):

    student_id: int

    application_number: str = Field(
        min_length=3,
        max_length=50,
    )

    program: str = Field(
        min_length=2,
        max_length=150,
    )

    admission_type: str = "regular"

    status: str = "pending"

    application_date: Optional[date] = None

    remarks: Optional[str] = None



class AdmissionUpdate(BaseModel):

    program: Optional[str] = None
    admission_type: Optional[str] = None
    remarks: Optional[str] = None


# ADMISSION ELIGIBILITY REVIEW




class AdmissionEligibilityReview(BaseModel):

    eligibility_status: str = Field(
        min_length=2,
        max_length=50,
    )

    eligibility_reason: Optional[str] = Field(
        default=None,
        max_length=2000,
    )

    remarks: Optional[str] = Field(
        default=None,
        max_length=2000,
    )

# ADMISSION RESPONSE


class AdmissionResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    organization_id: int

    student_id: int

    application_number: str

    program: str

    admission_type: str

    status: str

    eligibility_status: str

    eligibility_reason: Optional[str]

    reviewed_by_user_id: Optional[int]

    reviewed_at: Optional[datetime]

    application_date: date

    applied_at: Optional[datetime]

    decision_at: Optional[datetime]

    remarks: Optional[str]