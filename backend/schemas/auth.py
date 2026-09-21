from pydantic import BaseModel, EmailStr, Field, field_validator



# REGISTERED USER LOGIN


class LoginRequest(BaseModel):
    """
    Login schema for registered users.

    Authentication requires:

        organization_slug
        email
        password

    Supported registered users:

        ADMIN
        TEACHER
        STUDENT
    """

    organization_slug: str = Field(
        min_length=2,
        max_length=100,
        description="Public slug of the college/organization.",
    )

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=100,
    )

    @field_validator("organization_slug", mode="before")
    @classmethod
    def normalize_organization_slug(cls, value):
        if value is None:
            return value

        return str(value).strip().lower()



# APPLICANT LOGIN


class ApplicantLoginRequest(BaseModel):
    """
    Login schema for applicants who do not yet have a User account.

    Authentication requires:

        organization_slug
        application_number
        password

    Applicant credentials are stored against the Student record.

    No User account is required at this stage.
    """

    organization_slug: str = Field(
        min_length=2,
        max_length=100,
        description="Public slug of the college/organization.",
    )

    application_number: str = Field(
        min_length=3,
        max_length=50,
        description="Application number assigned after application submission.",
    )

    password: str = Field(
        min_length=8,
        max_length=100,
    )

    @field_validator("organization_slug", mode="before")
    @classmethod
    def normalize_organization_slug(cls, value):
        if value is None:
            return value

        return str(value).strip().lower()

    @field_validator("application_number", mode="before")
    @classmethod
    def normalize_application_number(cls, value):
        if value is None:
            return value

        return str(value).strip().upper()



# JWT TOKEN


class Token(BaseModel):
    """
    Authentication token returned after successful login.
    """

    access_token: str

    token_type: str = "bearer"



# ORGANIZATION + ADMIN SIGNUP


class SignupRequest(BaseModel):
    """
    Create a new organization and its initial ADMIN account.
    """

    organization_name: str = Field(
        min_length=2,
        max_length=100,
    )

    organization_slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100,
    )