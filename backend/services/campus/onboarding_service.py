from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud.onboarding import (
    create_onboarding_task,
    get_student_onboarding,
    get_onboarding_task,
    update_onboarding_task,
    get_onboarding_summary,
    initialize_student_onboarding,
    get_next_onboarding_action,

    # Automatic onboarding
    auto_complete_task,
    mark_waiting_for_student,
    mark_needs_human_review,

    # Human exception handling
    approve_onboarding_task,
    request_onboarding_changes,

    # Compatibility
    complete_onboarding_task,
    complete_academic_registration,
    complete_library_registration,
    complete_id_card_registration,
)

from schemas.onboarding import (
    OnboardingTaskCreate,
    OnboardingTaskUpdate,
)

from models.student import Student
from models.onboarding_task import OnboardingTask
from models.user import User



# STAFF / ADMIN — BASIC TASK OPERATIONS


def create_onboarding_task_service(
    db: Session,
    task_data: OnboardingTaskCreate,
    organization_id: int,
):
    return create_onboarding_task(
        db=db,
        task_data=task_data,
        organization_id=organization_id,
    )


def get_student_onboarding_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return get_student_onboarding(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )


def get_onboarding_task_service(
    db: Session,
    task_id: int,
    organization_id: int,
):
    return get_onboarding_task(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )


def update_onboarding_task_service(
    db: Session,
    task_id: int,
    task_data: OnboardingTaskUpdate,
    organization_id: int,
):
    return update_onboarding_task(
        db=db,
        task_id=task_id,
        task_data=task_data,
        organization_id=organization_id,
    )



# SUMMARY


def get_onboarding_summary_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return get_onboarding_summary(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# INITIALIZATION


def initialize_student_onboarding_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Initialize onboarding tasks.

    This is idempotent.

    If the tasks already exist, they are not duplicated.
    """

    result = initialize_student_onboarding(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    db.commit()

    return result


def initialize_onboarding_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Compatibility alias.
    """

    return initialize_student_onboarding_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# NEXT ACTION


def get_next_onboarding_action_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return get_next_onboarding_action(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# ADMIN EXCEPTION QUEUE


def get_onboarding_admin_queue_service(
    db: Session,
    organization_id: int,
):
    """
    Return only onboarding tasks that actually require
    human intervention.
    """

    from crud.onboarding import get_admin_onboarding_queue

    return get_admin_onboarding_queue(
        db=db,
        organization_id=organization_id,
    )



# HUMAN EXCEPTION APPROVAL


def approve_onboarding_task_service(
    db: Session,
    task_id: int,
    organization_id: int,
    reviewer_id: Optional[int] = None,
    notes: Optional[str] = None,
):
    """
    Approve a task that was sent to human review.

    Normal onboarding should NOT use this.

    This exists only for exceptional cases.
    """

    if reviewer_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviewer ID is required.",
        )

    return approve_onboarding_task(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
        reviewer_id=reviewer_id,
        notes=notes,
    )



# REQUEST CHANGES


def request_onboarding_changes_service(
    db: Session,
    task_id: int,
    organization_id: int,
    reviewer_id: Optional[int] = None,
    notes: Optional[str] = None,
):
    """
    Send an exception task back to the student.
    """

    if reviewer_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviewer ID is required.",
        )

    return request_onboarding_changes(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
        reviewer_id=reviewer_id,
        notes=notes,
    )



# LEGACY DIRECT COMPLETE


def complete_onboarding_task_service(
    db: Session,
    task_id: int,
    organization_id: int,
):
    """
    Kept for API compatibility.

    Direct completion is intentionally blocked by the CRUD layer.
    """

    return complete_onboarding_task(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )



# SPECIAL REGISTRATION COMPATIBILITY


def complete_academic_registration_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return complete_academic_registration(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )


def complete_library_registration_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return complete_library_registration(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )


def complete_id_card_registration_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    return complete_id_card_registration(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# STUDENT RESOLUTION


def _get_current_student(
    db: Session,
    current_user: User,
) -> Student:

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

    return student



# STUDENT — INITIALIZE


def initialize_my_onboarding_service(
    db: Session,
    current_user: User,
):
    """
    Compatibility/recovery endpoint.

    Normal onboarding is automatically initialized after
    admission confirmation.
    """

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    return initialize_student_onboarding_service(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# STUDENT — GET TASKS


def get_my_onboarding_tasks_service(
    db: Session,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    return get_student_onboarding(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# STUDENT — GET SUMMARY


def get_my_onboarding_summary_service(
    db: Session,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    return get_onboarding_summary(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# STUDENT — GET NEXT ACTION


def get_my_next_onboarding_action_service(
    db: Session,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    return get_next_onboarding_action(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# STUDENT — GET SINGLE TASK


def get_my_onboarding_task_service(
    db: Session,
    task_id: int,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    task = get_onboarding_task(
        db=db,
        task_id=task_id,
        organization_id=current_user.organization_id,
    )

    if task.student_id != student.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to access "
                "this onboarding task."
            ),
        )

    return task



# STUDENT — START TASK

#
# These two functions are retained ONLY for compatibility with
# an older frontend/router.
#
# They DO NOT complete onboarding.
#


def start_my_onboarding_task_service(
    db: Session,
    task_id: int,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    task = (
        db.query(OnboardingTask)
        .filter(
            OnboardingTask.id == task_id,
            OnboardingTask.student_id == student.id,
        )
        .first()
    )

    if task is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding task not found.",
        )

    if task.status == "completed":

        return task

    if task.status in {
        "pending",
        "changes_requested",
        "waiting_for_student",
    }:

        task.status = "in_progress"

        task.updated_at = __import__(
            "datetime"
        ).datetime.utcnow()

        db.commit()
        db.refresh(task)

    return task



# STUDENT — SUBMIT TASK


def submit_my_onboarding_task_service(
    db: Session,
    task_id: int,
    current_user: User,
):

    student = _get_current_student(
        db=db,
        current_user=current_user,
    )

    task = (
        db.query(OnboardingTask)
        .filter(
            OnboardingTask.id == task_id,
            OnboardingTask.student_id == student.id,
        )
        .first()
    )

    if task is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding task not found.",
        )

    if task.status == "completed":

        return task

    # ------------------------------------------------------------
    # IMPORTANT
    # ------------------------------------------------------------
    #
    # The student is NOT approving the task.
    #
    # Submission simply tells the system that the student
    # has provided the required information.
    #
    # The automation agent will process it.
    # ------------------------------------------------------------

    if task.status not in {
        "in_progress",
        "waiting_for_student",
        "changes_requested",
    }:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This onboarding task cannot be submitted "
                "in its current state."
            ),
        )

    task.status = "processing"

    task.updated_at = __import__(
        "datetime"
    ).datetime.utcnow()

    db.commit()
    db.refresh(task)

    return task



# AUTOMATION


def run_onboarding_automation_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Run the automatic onboarding agent.
    """

    from services.agent.onboarding_agent import (
        OnboardingAutomationAgent,
    )

    agent = OnboardingAutomationAgent()

    return agent.run(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )