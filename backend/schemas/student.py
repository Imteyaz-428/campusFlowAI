from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)



# PUBLIC STUDENT APPLICATION


class StudentCreate(BaseModel):
    """
    Public student application.

    Authentication is NOT required to submit an application.

    The applicant provides:

        organization_slug
        personal information
        academic information
        applicant password

    The password is hashed by the backend and is NEVER returned
    in the API response.

    Lifecycle:

        PUBLIC APPLICATION
                ↓
        APPLICATION NUMBER
                ↓
        APPLICANT LOGIN
        (application number + password)
                ↓
        DOCUMENT VERIFICATION
                ↓
        ADMISSION REVIEW
                ↓
        FEE
                ↓
        ADMISSION CONFIRMATION
                ↓
        STUDENT ACCOUNT
    """

    # ------------------------------------------------------------
    # ORGANIZATION
    # ------------------------------------------------------------

    organization_slug: str = Field(
        min_length=2,
        max_length=100,
        description="Public slug of the college/organization.",
    )

    # ------------------------------------------------------------
    # PERSONAL INFORMATION
    # ------------------------------------------------------------

    full_name: str = Field(
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    # ------------------------------------------------------------
    # ACADEMIC INFORMATION
    # ------------------------------------------------------------

    program: str = Field(
        min_length=2,
        max_length=150,
    )

    department: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    academic_year: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    semester: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    # ------------------------------------------------------------
    # APPLICANT AUTHENTICATION
    # ------------------------------------------------------------
    #
    # This password is used during the applicant stage.
    #
    # The backend will store ONLY:
    #
    #     applicant_password_hash
    #
    # Plain password is never stored in PostgreSQL.
    #
    # Applicant login:
    #
    #     organization_slug
    #     +
    #     application_number
    #     +
    #     password
    #
    # Later OTP authentication can be added without changing
    # the overall authentication architecture.
    # ------------------------------------------------------------

    password: str = Field(
        min_length=8,
        max_length=128,
        description=(
            "Password used by the applicant to access "
            "their application and CampusFlow services."
        ),
    )

    # ------------------------------------------------------------
    # NORMALIZATION
    # ------------------------------------------------------------

    @field_validator(
        "organization_slug",
        mode="before",
    )
    @classmethod
    def normalize_organization_slug(cls, value):
        if value is None:
            return value

        return str(value).strip().lower()

    @field_validator(
        "full_name",
        "program",
        "department",
        "academic_year",
        "semester",
        "phone",
        mode="before",
    )
    @classmethod
    def strip_string_values(cls, value):
        if value is None:
            return value

        return str(value).strip()

    @field_validator(
        "password",
        mode="before",
    )
    @classmethod
    def validate_password(cls, value):
        if value is None:
            return value

        value = str(value).strip()

        if len(value) < 8:
            raise ValueError(
                "Password must contain at least 8 characters."
            )

        return value



# STAFF STUDENT PROFILE UPDATE


class StudentUpdate(BaseModel):
    """
    Staff-only student profile update.

    Editable fields:

        full_name
        email
        phone
        program
        department
        academic_year
        semester

    Authentication credentials and workflow-controlled fields
    are intentionally excluded.
    """

    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    email: Optional[EmailStr] = None

    phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    program: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    department: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    academic_year: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    semester: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    # ------------------------------------------------------------
    # NORMALIZATION
    # ------------------------------------------------------------

    @field_validator(
        "full_name",
        "program",
        "department",
        "academic_year",
        "semester",
        "phone",
        mode="before",
    )
    @classmethod
    def strip_string_values(cls, value):
        if value is None:
            return value

        return str(value).strip()



# STUDENT RESPONSE


class StudentResponse(BaseModel):
    """
    Student representation returned by the API.

    Authentication credentials are intentionally excluded.
    """

    id: int

    organization_id: int

    # NULL while the student is only an applicant.
    user_id: Optional[int] = None

    # ------------------------------------------------------------
    # PERSONAL INFORMATION
    # ------------------------------------------------------------

    full_name: str

    email: EmailStr

    phone: Optional[str] = None

    # ------------------------------------------------------------
    # ACADEMIC INFORMATION
    # ------------------------------------------------------------

    program: str

    department: Optional[str] = None

    academic_year: Optional[str] = None

    semester: Optional[str] = None

    # ------------------------------------------------------------
    # APPLICATION STATUS
    # ------------------------------------------------------------

    status: str

    # ------------------------------------------------------------
    # CAMPUSFLOW IDENTIFIERS
    # ------------------------------------------------------------

    application_number: Optional[str] = None

    admission_number: Optional[str] = None

    roll_number: Optional[str] = None

    # ------------------------------------------------------------
    # ADMISSION STATUS
    # ------------------------------------------------------------

    admission_status: str

    # ------------------------------------------------------------
    # ORM CONFIGURATION
    # ------------------------------------------------------------

    model_config = ConfigDict(
        from_attributes=True,
    )