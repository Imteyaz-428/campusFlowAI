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


def signup(db: Session, data: SignupRequest):

    try:

        organization = create_organization(
            db=db,
            organization=OrganizationCreate(
                name=data.organization_name,
                slug=data.organization_slug
            )
        )

        admin = create_user(
            db=db,
            user=UserCreate(
                name=data.name,
                email=data.email,
                password=data.password,
                role=UserRole.ADMIN
            ),
            organization_id=organization.id
        )
        db.commit()
        token = create_access_token(
            {
                "sub": str(admin.id),
                "role": admin.role.value,
                "email": admin.email,
                "organization_id": admin.organization_id
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or organization already exists."
        )