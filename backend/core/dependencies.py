from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import (
    JWTError,
    jwt,
)

from sqlalchemy.orm import Session

from core.enums import UserRole
from core.security import (
    SECRET_KEY,
    ALGORITHM,
)

from dependencies.database import get_db

from models.student import Student
from models.user import User


# ================================================================
# BEARER AUTHENTICATION
# ================================================================

bearer_scheme = HTTPBearer(
    auto_error=True,
)


# ================================================================
# INTERNAL JWT DECODER
# ================================================================

def _decode_token(
    token: str,
):
    """
    Decode and validate a JWT.

    This function only validates the cryptographic token.

    Identity and authorization are always resolved from the
    database afterward.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

    except JWTError:
        raise credentials_exception

    return payload


# ================================================================
# CURRENT USER
# ================================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    """
    Resolve a registered User from the JWT.

    This dependency is ONLY for User-based authentication.

    JWT:

        sub = User.id

    Applicant tokens are rejected here.

    The database is the source of truth for:

        - role
        - organization_id
        - email
        - account information
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    # ------------------------------------------------------------
    # EXTRACT TOKEN
    # ------------------------------------------------------------

    token = credentials.credentials

    # ------------------------------------------------------------
    # DECODE TOKEN
    # ------------------------------------------------------------

    payload = _decode_token(token)

    # ------------------------------------------------------------
    # REJECT APPLICANT TOKENS
    # ------------------------------------------------------------

    if payload.get("token_type") == "applicant":
        raise credentials_exception

    # ------------------------------------------------------------
    # GET USER ID
    # ------------------------------------------------------------

    user_id = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    # ------------------------------------------------------------
    # VALIDATE USER ID
    # ------------------------------------------------------------

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise credentials_exception

    if user_id <= 0:
        raise credentials_exception

    # ------------------------------------------------------------
    # LOAD USER FROM DATABASE
    # ------------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
        )
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


# ================================================================
# CURRENT APPLICANT
# ================================================================

def get_current_applicant(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    """
    Resolve an applicant Student from an applicant JWT.

    Applicant JWT:

        sub = Student.id
        token_type = applicant

    The Student and organization are always loaded from the
    database.

    The applicant cannot choose:

        student_id
        organization_id
        role
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid applicant authentication token.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    # ------------------------------------------------------------
    # EXTRACT TOKEN
    # ------------------------------------------------------------

    token = credentials.credentials

    # ------------------------------------------------------------
    # DECODE TOKEN
    # ------------------------------------------------------------

    payload = _decode_token(token)

    # ------------------------------------------------------------
    # REQUIRE APPLICANT TOKEN
    # ------------------------------------------------------------

    if payload.get("token_type") != "applicant":
        raise credentials_exception

    # ------------------------------------------------------------
    # GET STUDENT ID
    # ------------------------------------------------------------

    student_id = payload.get("sub")

    if student_id is None:
        raise credentials_exception

    # ------------------------------------------------------------
    # VALIDATE STUDENT ID
    # ------------------------------------------------------------

    try:
        student_id = int(student_id)

    except (TypeError, ValueError):
        raise credentials_exception

    if student_id <= 0:
        raise credentials_exception

    # ------------------------------------------------------------
    # LOAD STUDENT FROM DATABASE
    # ------------------------------------------------------------

    student = (
        db.query(Student)
        .filter(
            Student.id == student_id,
        )
        .first()
    )

    if student is None:
        raise credentials_exception

    return student


# ================================================================
# CURRENT STUDENT IDENTITY
# ================================================================

def get_current_student_identity(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    """
    Resolve the authenticated student's Student profile.

    Supports TWO authentication modes:

        1. Registered STUDENT
           JWT sub = User.id

        2. Applicant
           JWT sub = Student.id
           token_type = applicant

    The result is ALWAYS a Student object.

    This dependency is intended for services such as the
    CampusFlow AI Agent that need trusted student identity
    regardless of authentication stage.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid student authentication token.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    # ------------------------------------------------------------
    # EXTRACT TOKEN
    # ------------------------------------------------------------

    token = credentials.credentials

    # ------------------------------------------------------------
    # DECODE TOKEN
    # ------------------------------------------------------------

    payload = _decode_token(token)

    token_type = payload.get("token_type")

    # ============================================================
    # APPLICANT TOKEN
    # ============================================================

    if token_type == "applicant":

        student_id = payload.get("sub")

        if student_id is None:
            raise credentials_exception

        try:
            student_id = int(student_id)

        except (TypeError, ValueError):
            raise credentials_exception

        if student_id <= 0:
            raise credentials_exception

        student = (
            db.query(Student)
            .filter(
                Student.id == student_id,
            )
            .first()
        )

        if student is None:
            raise credentials_exception

        return student

    # ============================================================
    # REGISTERED USER TOKEN
    # ============================================================

    user_id = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise credentials_exception

    if user_id <= 0:
        raise credentials_exception

    # ------------------------------------------------------------
    # LOAD USER
    # ------------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
        )
        .first()
    )

    if user is None:
        raise credentials_exception

    # ------------------------------------------------------------
    # USER MUST BE A STUDENT
    # ------------------------------------------------------------

    if user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    # ------------------------------------------------------------
    # RESOLVE LINKED STUDENT
    # ------------------------------------------------------------

    student = (
        db.query(Student)
        .filter(
            Student.user_id == user.id,
            Student.organization_id == user.organization_id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No student profile is linked "
                "to this account."
            ),
        )

    return student


# ================================================================
# CURRENT ADMIN
# ================================================================

def get_current_admin(
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Require ADMIN access.
    """

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="College Admin access required.",
        )

    return current_user


# ================================================================
# CURRENT TEACHER
# ================================================================

def get_current_teacher(
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Require TEACHER access.
    """

    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required.",
        )

    return current_user


# ================================================================
# CURRENT STAFF
# ================================================================

def get_current_staff(
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Require STAFF access.

    STAFF consists of:

        ADMIN
        TEACHER

    Used for shared administrative/academic operations.
    """

    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required.",
        )

    return current_user


# ================================================================
# CURRENT REGISTERED STUDENT
# ================================================================

def get_current_student(
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Require a registered STUDENT User account.

    This dependency intentionally does NOT accept applicant
    authentication.

    Use get_current_student_identity() when an endpoint should
    support both applicants and registered students.
    """

    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    return current_user


# ================================================================
# GENERIC ROLE CHECK
# ================================================================

def require_role(
    required_role: UserRole,
):
    """
    Create a reusable dependency for role-based authorization.

    Example:

        Depends(require_role(UserRole.ADMIN))
    """

    def role_checker(
        current_user: User = Depends(
            get_current_user,
        ),
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"{required_role.value} access required."
                ),
            )

        return current_user

    return role_checker