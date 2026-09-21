from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies.database import get_db
from core.dependencies import get_current_user, get_current_student

from models.user import User
from models.student import Student

from schemas.onboarding import (
    OnboardingReviewRequest,
    OnboardingTaskCreate,
    OnboardingTaskUpdate,
)

from services.campus.onboarding_service import (
    create_onboarding_task_service,
    get_student_onboarding_service,
    get_onboarding_task_service,
    update_onboarding_task_service,
    get_onboarding_summary_service,
    initialize_student_onboarding_service,
    initialize_my_onboarding_service,
    get_next_onboarding_action_service,

    get_onboarding_admin_queue_service,

    get_my_onboarding_tasks_service,
    get_my_onboarding_summary_service,
    get_my_next_onboarding_action_service,
    get_my_onboarding_task_service,

    run_onboarding_automation_service,

    approve_onboarding_task_service,
    request_onboarding_changes_service,

    # Legacy compatibility
    complete_onboarding_task_service,
    complete_academic_registration_service,
    complete_library_registration_service,
    complete_id_card_registration_service,
)


router = APIRouter(
    prefix="/campus/onboarding",
    tags=["Campus Onboarding"],
)


# ================================================================
# ROLE HELPERS
# ================================================================


def get_role(current_user: User) -> str:

    role = getattr(
        current_user,
        "role",
        "",
    )

    value = getattr(
        role,
        "value",
        role,
    )

    value = str(value).strip().lower()

    if "." in value:
        value = value.split(".")[-1]

    return value


def require_staff(
    current_user: User = Depends(get_current_user),
) -> User:

    role = get_role(current_user)

    if role not in {
        "admin",
        "teacher",
        "staff",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only college staff can access this operation.",
        )

    return current_user


# ================================================================
# ADMIN / STAFF
# ================================================================


@router.get("/admin/queue")
def get_admin_onboarding_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """
    Return only onboarding tasks that require
    human intervention.
    """

    return get_onboarding_admin_queue_service(
        db=db,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STUDENT ONBOARDING — STAFF VIEW
# ================================================================


@router.get("/student/{student_id}")
def get_student_onboarding(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return get_student_onboarding_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


@router.get("/student/{student_id}/summary")
def get_student_onboarding_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return get_onboarding_summary_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


@router.get("/student/{student_id}/next-action")
def get_student_next_onboarding_action(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return get_next_onboarding_action_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# MANUAL INITIALIZATION — STAFF RECOVERY
# ================================================================


@router.post("/student/{student_id}/initialize")
def initialize_student_onboarding(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return initialize_student_onboarding_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STAFF — RECHECK AUTOMATION
# ================================================================


@router.post("/student/{student_id}/recheck")
def recheck_student_onboarding(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return run_onboarding_automation_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STAFF — CREATE TASK
# ================================================================


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_onboarding_task(
    task_data: OnboardingTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return create_onboarding_task_service(
        db=db,
        task_data=task_data,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STAFF — GET SINGLE TASK
# ================================================================


@router.get("/task/{task_id}")
def get_onboarding_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return get_onboarding_task_service(
        db=db,
        task_id=task_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STAFF — UPDATE TASK
# ================================================================


@router.put("/task/{task_id}")
def update_onboarding_task(
    task_id: int,
    task_data: OnboardingTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return update_onboarding_task_service(
        db=db,
        task_id=task_id,
        task_data=task_data,
        organization_id=current_user.organization_id,
    )


# ================================================================
# HUMAN EXCEPTION HANDLING
# ================================================================


@router.post("/task/{task_id}/approve")
def approve_onboarding_exception(
    task_id: int,
    review: Optional[OnboardingReviewRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return approve_onboarding_task_service(
        db=db,
        task_id=task_id,
        organization_id=current_user.organization_id,
        reviewer_id=current_user.id,
        notes=review.notes if review else None,
    )


@router.post("/task/{task_id}/request-changes")
def request_onboarding_changes(
    task_id: int,
    review: Optional[OnboardingReviewRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return request_onboarding_changes_service(
        db=db,
        task_id=task_id,
        organization_id=current_user.organization_id,
        reviewer_id=current_user.id,
        notes=review.notes if review else None,
    )


# ================================================================
# LEGACY COMPLETE ENDPOINT
# ================================================================


@router.post("/task/{task_id}/complete")
def complete_onboarding_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return complete_onboarding_task_service(
        db=db,
        task_id=task_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# LEGACY REGISTRATION ENDPOINTS
# ================================================================


@router.post("/student/{student_id}/academic-register")
def complete_academic_registration(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return complete_academic_registration_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


@router.post("/student/{student_id}/library-register")
def complete_library_registration(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return complete_library_registration_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


@router.post("/student/{student_id}/id-card-register")
def complete_id_card_registration(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return complete_id_card_registration_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STUDENT — OWN ONBOARDING
# ================================================================


@router.post("/me/initialize")
def initialize_my_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    return initialize_my_onboarding_service(
        db=db,
        current_user=current_user,
    )


# ================================================================
# STUDENT — RECHECK
# ================================================================


@router.post("/me/recheck")
def recheck_my_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id,
            Student.organization_id
            == current_user.organization_id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    return run_onboarding_automation_service(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )


# ================================================================
# STUDENT — TASKS
# ================================================================


@router.get("/me/tasks")
def get_my_onboarding_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    return get_my_onboarding_tasks_service(
        db=db,
        current_user=current_user,
    )


@router.get("/me/summary")
def get_my_onboarding_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    return get_my_onboarding_summary_service(
        db=db,
        current_user=current_user,
    )


@router.get("/me/next-action")
def get_my_next_onboarding_action(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    return get_my_next_onboarding_action_service(
        db=db,
        current_user=current_user,
    )


@router.get("/me/tasks/{task_id}")
def get_my_onboarding_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):

    return get_my_onboarding_task_service(
        db=db,
        task_id=task_id,
        current_user=current_user,
    )