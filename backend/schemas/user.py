from typing import Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)

from core.enums import UserRole
from schemas.organization import OrganizationInfo



# CREATE USER


class UserCreate(BaseModel):
    """
    Schema for creating an institutional user account.

    Used by ADMIN for accounts such as:

        TEACHER

    Student accounts will later be created through the dedicated
    admission-confirmation/account-activation workflow.
    """

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100,
    )

    role: UserRole = Field(
        description=(
            "Account role: admin, teacher, or student."
        )
    )

    # ------------------------------------------------------------
    # STUDENT DIRECT ENROLLMENT
    # ------------------------------------------------------------
    #
    # Used ONLY when role == UserRole.STUDENT.
    #
    # An admin enrolling a student here is a walk-in / offline
    # enrollment path that bypasses the public application and
    # fee-driven admission workflow. The academic profile fields
    # below are required in that case because they populate the
    # Student record created alongside the User account.
    #
    # Ignored for ADMIN and TEACHER accounts.
    # ------------------------------------------------------------

    program: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
        description="Required when role is student.",
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

    phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )



# USER RESPONSE


class UserResponse(BaseModel):
    """
    Public-safe representation of an authenticated user account.

    Password is intentionally never returned.
    """

    id: int

    name: str

    email: EmailStr

    role: UserRole

    organization: OrganizationInfo

    class Config:
        from_attributes = True



# UPDATE USER PROFILE


class UserUpdate(BaseModel):
    """
    Fields that can be changed through normal profile update.

    Role and organization are intentionally NOT included.

    Role changes should happen through a dedicated administrative
    workflow rather than a generic profile update.
    """

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    email: Optional[EmailStr] = None

    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=100,
    )



# CHANGE PASSWORD


class ChangePassword(BaseModel):
    """
    Schema for changing the authenticated user's password.
    """

    current_password: str = Field(
        min_length=1,
        max_length=100,
    )

    new_password: str = Field(
        min_length=8,
        max_length=100,
    )