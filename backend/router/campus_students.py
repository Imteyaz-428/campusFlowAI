from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import (
    get_current_student,
    get_current_user,
)

from core.enums import UserRole

from dependencies.database import get_db

from models.user import User

from schemas.student import (
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)

from services.campus.student_service import (
    create_student_service,
    get_student_by_user_service,
    get_student_service,
    list_students_service,
    update_student_service,
)


router = APIRouter(
    prefix="/campus/students",
    tags=["Campus - Students"],
)



# STAFF ACCESS


def _require_staff(
    current_user: User,
) -> User:
    """
    Require ADMIN or TEACHER access.

    Both roles may manage student records inside their own
    organization.
    """

    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.TEACHER,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only admin and teacher can access "
                "this resource."
            ),
        )

    return current_user



# PUBLIC STUDENT APPLICATION


@router.post(
    "/",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a public student application.

    Authentication is intentionally NOT required.

    The applicant provides:

        organization_slug
        full_name
        email
        program
        password
        other application details

    The password is hashed server-side and stored as:

        Student.applicant_password_hash

    No User account is created at this stage.

    Flow:

        PUBLIC APPLICATION
                ↓
        organization_slug
                ↓
        Organization
                ↓
        Generate Application Number
                ↓
        Hash Applicant Password
                ↓
        Student
                ↓
        Admission
                ↓
        Document Verification
                ↓
        Admission Workflow
    """

    return create_student_service(
        db=db,
        student_data=student_data,
    )



# STUDENT SELF PROFILE


@router.get(
    "/me",
    response_model=StudentResponse,
)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_student
    ),
):
    """
    Return the student profile linked to the authenticated
    student account.

    This endpoint is for registered STUDENT accounts.

    Applicants who have not yet received a User account will
    use applicant authentication instead.
    """

    student = get_student_by_user_service(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
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



# STAFF - LIST STUDENTS


@router.get(
    "/",
    response_model=list[StudentResponse],
)
def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    List students belonging to the current organization.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return list_students_service(
        db=db,
        organization_id=current_user.organization_id,
    )



# STAFF - GET STUDENT


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Get one student.

    Allowed:
        ADMIN
        TEACHER

    The organization_id is taken from the authenticated
    user, preventing cross-college access.
    """

    _require_staff(current_user)

    return get_student_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )



# STAFF - UPDATE STUDENT


@router.put(
    "/{student_id}",
    response_model=StudentResponse,
)
def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Update editable student profile information.

    Allowed:
        ADMIN
        TEACHER

    StudentUpdate does NOT contain workflow-controlled fields.

    Therefore this endpoint cannot directly modify:

        application_number
        admission_number
        roll_number
        admission_status
        organization_id
        user_id
        applicant_password_hash
    """

    _require_staff(current_user)

    return update_student_service(
        db=db,
        student_id=student_id,
        student_data=student_data,
        organization_id=current_user.organization_id,
    )