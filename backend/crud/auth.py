from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.enums import UserRole
from core.security import create_access_token

from crud.organization import create_organization
from crud.user import create_user

from schemas.auth import SignupRequest
from schemas.organization import OrganizationCreate
from schemas.user import UserCreate



# SIGNUP


def signup(
    db: Session,
    data: SignupRequest,
):
    """
    Create a new organization and its initial ADMIN account.

    Signup flow:

        Signup Request
              ↓
        Create Organization
              ↓
        Create ADMIN User
              ↓
        Generate JWT
              ↓
        Return Token

    The JWT contains only the user ID.
    Role and organization information are loaded from the database
    whenever authorization is required.
    """

    try:

    
        # CREATE ORGANIZATION
    

        organization = create_organization(
            db=db,
            organization=OrganizationCreate(
                name=data.organization_name.strip(),
                slug=data.organization_slug.strip().lower(),
            ),
        )

    
        # CREATE INITIAL ADMIN
    

        admin = create_user(
            db=db,
            user=UserCreate(
                name=data.name.strip(),
                email=data.email,
                password=data.password,
                role=UserRole.ADMIN,
            ),
            organization_id=organization.id,
        )

    
        # CREATE ACCESS TOKEN
    

        access_token = create_access_token(
            {
                "sub": str(admin.id),
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or organization already exists.",
        )