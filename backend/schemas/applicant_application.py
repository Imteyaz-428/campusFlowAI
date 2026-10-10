from datetime import date, datetime

from pydantic import BaseModel, ConfigDict



# CREATE / UPDATE APPLICATION


class ApplicantApplicationBase(BaseModel):
   
    # PERSONAL INFORMATION
   

    date_of_birth: date | None = None
    gender: str | None = None
    category: str | None = None
    nationality: str | None = None

   
    # PARENT / GUARDIAN
   

    father_name: str | None = None
    mother_name: str | None = None

   
    # ADDRESS
   

    address_line: str | None = None
    city: str | None = None
    district: str | None = None
    state: str | None = None
    pincode: str | None = None

   
    # 10TH
   

    tenth_school_name: str | None = None
    tenth_board: str | None = None
    tenth_passing_year: int | None = None
    tenth_roll_number: str | None = None
    tenth_percentage: float | None = None

   
    # 12TH
   

    twelfth_school_name: str | None = None
    twelfth_board: str | None = None
    twelfth_stream: str | None = None
    twelfth_passing_year: int | None = None
    twelfth_roll_number: str | None = None
    twelfth_percentage: float | None = None

   
    # JEE / ENTRANCE
   

    jee_attempted: bool | None = None
    jee_year: int | None = None
    jee_percentile: float | None = None
    jee_rank: int | None = None


class ApplicantApplicationCreate(ApplicantApplicationBase):
    pass


class ApplicantApplicationUpdate(ApplicantApplicationBase):
    pass



# APPLICATION RESPONSE


class ApplicantApplicationResponse(ApplicantApplicationBase):
    model_config = ConfigDict(
        from_attributes=True
    )

   
    # APPLICATION IDENTIFICATION
   

    id: int
    student_id: int
    organization_id: int

   
    # APPLICATION STATUS
   

    status: str
    completion_percentage: int

    submitted_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

   
    # ADMISSION INFORMATION
    #
    # These fields are optional because they are not columns
    # of ApplicantApplication itself.
    # They can later be populated from Student / Admission
    # when the response is enriched by the router/service.
   

    application_number: str | None = None

    program: str | None = None

    admission_type: str | None = None

    admission_status: str | None = None

    eligibility_status: str | None = None

    eligibility_reason: str | None = None

    admission_number: str | None = None

    roll_number: str | None = None