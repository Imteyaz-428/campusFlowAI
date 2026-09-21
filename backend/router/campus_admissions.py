from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies.database import get_db
from core.dependencies import get_current_user
from core.enums import UserRole
from models.user import User

from schemas.admission import (
    AdmissionCreate,
    AdmissionUpdate,
    AdmissionResponse,
    AdmissionEligibilityReview,
)

from schemas.admission_review import (
    AdmissionReviewResponse,
)
from services.campus.admission_review_service import (
    run_admission_review_service,
)
from services.campus.student_service import (
    get_student_by_user_service,
)
from services.campus.admission_service import (
    create_admission_service,
    list_admissions_service,
    get_admission_service,
    get_student_admission_service,
    update_admission_service,
    review_admission_eligibility_service,
)

from services.campus.admission_confirmation_service import (
    confirm_admission_service,
)


# ROUTER


router = APIRouter(
    prefix="/campus/admissions",
    tags=["Campus - Admissions"],
)



# STAFF AUTHORIZATION


def _require_staff(current_user: User):
    """
    ADMIN and TEACHER can manage admission records.

    This helper is used for normal admission operations.
    """

    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.TEACHER,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only college admins and teachers "
                "can manage admission records."
            ),
        )



# ADMIN AUTHORIZATION


def _require_admin(current_user: User):
    """
    Only ADMIN can approve or reject an admission.

    Teachers are intentionally not allowed to make
    the final eligibility decision.
    """

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only college administrators can "
                "approve or reject admissions."
            ),
        )



# CREATE ADMISSION


@router.post(
    "/",
    response_model=AdmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admission(
    admission_data: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    _require_staff(current_user)

    return create_admission_service(
        db,
        admission_data,
        organization_id=current_user.organization_id,
    )



# LIST ADMISSIONS


@router.get(
    "/",
    response_model=list[AdmissionResponse],
)
def get_admissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    _require_staff(current_user)

    return list_admissions_service(
        db,
        organization_id=current_user.organization_id,
    )
    
    

# ADMIN — CONFIRM ADMISSION


@router.post(
    "/{admission_id}/confirm",
    response_model=AdmissionResponse,
)
def confirm_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ADMIN ONLY.

    Confirms an approved admission only when all mandatory
    admission fees have been paid.

    Workflow:

        APPROVED
            ↓
        Mandatory fee check
            ↓
        All mandatory fees PAID
            ↓
        CONFIRMED
            ↓
        Admission number generated
    """


    # ADMIN ONLY


    _require_admin(current_user)


    # CONFIRM ADMISSION


    return confirm_admission_service(
        db=db,
        admission_id=admission_id,
        organization_id=current_user.organization_id,
    )


# GET STUDENT ADMISSION


@router.get(
    "/student/{student_id}",
    response_model=AdmissionResponse,
)
def get_student_admission(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    _require_staff(current_user)

    return get_student_admission_service(
        db,
        student_id,
        organization_id=current_user.organization_id,
    )

#
# STUDENT — GET MY ADMISSION


@router.get(
    "/me",
    response_model=AdmissionResponse,
)
def get_my_admission(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    STUDENT SELF-SERVICE.

    Returns the admission record belonging to the currently
    authenticated student.
    """

    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    student = get_student_by_user_service(
        db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    return get_student_admission_service(
        db,
        student.id,
        organization_id=current_user.organization_id,
    )
    

# ADMIN — REVIEW ADMISSION ELIGIBILITY


@router.put(
    "/{admission_id}/eligibility-review",
    response_model=AdmissionResponse,
)
def review_admission_eligibility(
    admission_id: int,
    review_data: AdmissionEligibilityReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ADMIN ONLY.

    Administrator reviews the applicant's eligibility.

    Possible decisions:

        eligible
        not_eligible

    If eligible:

        admission.status = approved

    If not eligible:

        admission.status = rejected

    The system also records:

        eligibility_status
        eligibility_reason
        reviewed_by_user_id
        reviewed_at
        decision_at
        remarks

    Example request:

        PUT
        /campus/admissions/1/eligibility-review

        {
            "eligibility_status": "eligible",
            "eligibility_reason": "Applicant satisfies all academic requirements.",
            "remarks": "Verified by admission committee."
        }
    """


    # ADMIN ONLY


    _require_admin(current_user)


    # REVIEW ADMISSION


    return review_admission_eligibility_service(
        db=db,
        admission_id=admission_id,
        review_data=review_data,
        organization_id=current_user.organization_id,
        reviewed_by_user_id=current_user.id,
    )


# ADMIN — AI ADMISSION REVIEW


@router.post(
    "/{admission_id}/ai-review",
    response_model=AdmissionReviewResponse,
)
def ai_admission_review(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ADMIN ONLY.

    Run an AI-assisted admission review.

    The AI analyzes:

        - application information
        - student information
        - submitted documents
        - document verification status
        - extracted document information
        - official institutional admission criteria

    Possible AI recommendations:

        eligible
        not_eligible
        manual_review

    IMPORTANT:

        The AI does NOT change the admission record.

        The administrator makes the final eligibility decision
        using the existing eligibility-review endpoint.
    """


    # ADMIN ONLY


    _require_admin(current_user)


    # RUN AI REVIEW


    try:

        return run_admission_review_service(
            db=db,
            admission_id=admission_id,
            organization_id=(
                current_user.organization_id
            ),
        )

    except HTTPException:
        raise

    except RuntimeError as exc:

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )
        

# GET ADMISSION BY ID


@router.get(
    "/{admission_id}",
    response_model=AdmissionResponse,
)
def get_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    _require_staff(current_user)

    return get_admission_service(
        db,
        admission_id,
        organization_id=current_user.organization_id,
    )



# UPDATE ADMISSION


@router.put(
    "/{admission_id}",
    response_model=AdmissionResponse,
)
def update_admission(
    admission_id: int,
    admission_data: AdmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    _require_staff(current_user)

    return update_admission_service(
        db,
        admission_id,
        admission_data,
        organization_id=current_user.organization_id,
    )