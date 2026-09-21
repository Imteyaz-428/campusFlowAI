from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.security import (
    create_access_token,
    verify_password,
)

from crud.auth import signup
from crud.user import authenticate_user

from dependencies.database import get_db

from models.organization import Organization
from models.student import Student
from models.user import User

from schemas.auth import (
    ApplicantLoginRequest,
    LoginRequest,
    SignupRequest,
    Token,
)

from schemas.user import UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)



# SIGNUP


@router.post(
    "/signup",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
)
def signup_user(
    data: SignupRequest,
    db: Session = Depends(get_db),
):
    """
    Create a new organization and its initial ADMIN account.

    This endpoint is public because the first account of a new
    organization must be able to register without authentication.
    """

    return signup(
        db=db,
        data=data,
    )



# REGISTERED USER LOGIN


@router.post(
    "/login",
    response_model=Token,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate a registered user.

    Required:

        organization_slug
        email
        password

    Supported accounts:

        ADMIN
        TEACHER
        STUDENT

    Organization is resolved from the supplied slug.

    The JWT contains only:

        sub = User.id

    Authorization information remains database-controlled.
    """


    # 1. RESOLVE ORGANIZATION


    organization = (
        db.query(Organization)
        .filter(
            Organization.slug == data.organization_slug
        )
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or credentials.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # 2. AUTHENTICATE USER


    user = authenticate_user(
        db=db,
        email=str(data.email).strip().lower(),
        password=data.password,
        organization_id=organization.id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or credentials.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

   
    


    # 4. CREATE USER JWT


    access_token = create_access_token(
        {
            "sub": str(user.id),
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }



# APPLICANT LOGIN


@router.post(
    "/applicant-login",
    response_model=Token,
)
def applicant_login(
    data: ApplicantLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate a student applicant who does not yet have
    a User account.

    Required:

        organization_slug
        application_number
        password

    The applicant is resolved from:

        organization
            +
        application_number

    Password verification uses the bcrypt hash stored on
    Student.applicant_password_hash.

    No User record is required.

    JWT:

        sub = Student.id
        token_type = applicant

    The server will later resolve the student and organization
    from the database rather than trusting arbitrary identity
    information from the token.
    """


    # 1. RESOLVE ORGANIZATION


    organization = (
        db.query(Organization)
        .filter(
            Organization.slug == data.organization_slug
        )
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or credentials.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # 2. RESOLVE APPLICANT


    student = (
        db.query(Student)
        .filter(
            Student.organization_id == organization.id,
            Student.application_number
            == data.application_number,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or credentials.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # 3. CHECK APPLICANT PASSWORD


    if not student.applicant_password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Applicant authentication is not available.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not verify_password(
        data.password,
        student.applicant_password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or credentials.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # 4. CREATE APPLICANT JWT


    access_token = create_access_token(
        {
            "sub": str(student.id),
            "token_type": "applicant",
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }



# CURRENT USER


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Return the currently authenticated registered user.

    This endpoint is for User-based authentication.

    Applicant tokens are intentionally handled separately.
    """

    return current_user