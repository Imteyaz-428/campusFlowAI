from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.id_generator import generate_roll_number

from models.onboarding_task import OnboardingTask
from models.student import Student

from schemas.onboarding import (
    OnboardingTaskCreate,
    OnboardingTaskUpdate,
)



# STATUS CONSTANTS


STATUS_PENDING = "pending"

STATUS_IN_PROGRESS = "in_progress"

STATUS_WAITING_FOR_STUDENT = "waiting_for_student"

STATUS_PROCESSING = "processing"

STATUS_COMPLETED = "completed"

STATUS_NEEDS_HUMAN_REVIEW = "needs_human_review"

STATUS_FAILED = "failed"

# Legacy compatibility
STATUS_READY_FOR_REVIEW = "ready_for_review"
STATUS_SUBMITTED = "submitted"
STATUS_CHANGES_REQUESTED = "changes_requested"


VALID_STATUSES = {
    STATUS_PENDING,
    STATUS_IN_PROGRESS,
    STATUS_WAITING_FOR_STUDENT,
    STATUS_PROCESSING,
    STATUS_COMPLETED,
    STATUS_NEEDS_HUMAN_REVIEW,
    STATUS_FAILED,

    STATUS_READY_FOR_REVIEW,
    STATUS_SUBMITTED,
    STATUS_CHANGES_REQUESTED,
}



# DEFAULT TASKS


DEFAULT_TASKS = [
    {
        "task_key": "academic_registration",
        "title": "Academic Registration",
        "description": (
            "Automatically complete academic registration "
            "after admission confirmation and required "
            "academic information are available."
        ),
        "required": True,
    },
    {
        "task_key": "library_registration",
        "title": "Library Registration",
        "description": (
            "Automatically activate the student's "
            "library registration after admission confirmation."
        ),
        "required": True,
    },
    {
        "task_key": "id_card_registration",
        "title": "ID Card Registration",
        "description": (
            "Automatically process ID card registration "
            "after the student's photograph is verified."
        ),
        "required": True,
    },
]



# STUDENT LOOKUP


def _get_student_in_org(
    db: Session,
    student_id: int,
    organization_id: int,
) -> Student:

    student = (
        db.query(Student)
        .filter(
            Student.id == student_id,
            Student.organization_id == organization_id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    return student



# TASK LOOKUP


def _get_task_in_org(
    db: Session,
    task_id: int,
    organization_id: int,
) -> OnboardingTask:

    task = (
        db.query(OnboardingTask)
        .join(
            Student,
            OnboardingTask.student_id == Student.id,
        )
        .filter(
            OnboardingTask.id == task_id,
            Student.organization_id == organization_id,
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding task not found.",
        )

    return task



# TASK BY KEY


def _get_task_by_key(
    db: Session,
    student_id: int,
    task_key: str,
) -> Optional[OnboardingTask]:

    return (
        db.query(OnboardingTask)
        .filter(
            OnboardingTask.student_id == student_id,
            OnboardingTask.task_key == task_key,
        )
        .first()
    )



# STUDENT TASKS


def _get_student_tasks(
    db: Session,
    student_id: int,
):

    return (
        db.query(OnboardingTask)
        .filter(
            OnboardingTask.student_id == student_id,
        )
        .order_by(
            OnboardingTask.id.asc()
        )
        .all()
    )



# CREATE TASK


def create_onboarding_task(
    db: Session,
    task_data: OnboardingTaskCreate,
    organization_id: int,
):

    _get_student_in_org(
        db=db,
        student_id=task_data.student_id,
        organization_id=organization_id,
    )

    if task_data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid onboarding status: {task_data.status}",
        )

    existing = _get_task_by_key(
        db=db,
        student_id=task_data.student_id,
        task_key=task_data.task_key,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Onboarding task already exists.",
        )

    task = OnboardingTask(
        student_id=task_data.student_id,
        task_key=task_data.task_key,
        title=task_data.title,
        description=task_data.description,
        required=task_data.required,
        status=task_data.status,
        due_date=task_data.due_date,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task



# GET STUDENT ONBOARDING


def get_student_onboarding(
    db: Session,
    student_id: int,
    organization_id: int,
):

    _get_student_in_org(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    return _get_student_tasks(
        db=db,
        student_id=student_id,
    )



# GET SINGLE TASK


def get_onboarding_task(
    db: Session,
    task_id: int,
    organization_id: int,
):

    return _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )



# UPDATE METADATA


def update_onboarding_task(
    db: Session,
    task_id: int,
    task_data: OnboardingTaskUpdate,
    organization_id: int,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.required is not None:
        task.required = task_data.required

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    db.commit()
    db.refresh(task)

    return task



# SUMMARY


def get_onboarding_summary(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return the complete onboarding summary for a student.

    Required tasks are calculated separately from total tasks
    because onboarding may contain optional/custom tasks.
    """

    # ------------------------------------------------------------
    # Validate student belongs to organization
    # ------------------------------------------------------------

    _get_student_in_org(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # Get all onboarding tasks
    # ------------------------------------------------------------

    tasks = _get_student_tasks(
        db=db,
        student_id=student_id,
    )

    total = len(tasks)

    # ------------------------------------------------------------
    # Required tasks
    # ------------------------------------------------------------

    required_tasks = sum(
        bool(task.required)
        for task in tasks
    )

    # ------------------------------------------------------------
    # Status counts
    # ------------------------------------------------------------

    completed = sum(
        task.status == STATUS_COMPLETED
        for task in tasks
    )

    pending = sum(
        task.status == STATUS_PENDING
        for task in tasks
    )

    in_progress = sum(
        task.status == STATUS_IN_PROGRESS
        for task in tasks
    )

    waiting_for_student = sum(
        task.status == STATUS_WAITING_FOR_STUDENT
        for task in tasks
    )

    processing = sum(
        task.status == STATUS_PROCESSING
        for task in tasks
    )

    needs_human_review = sum(
        task.status == STATUS_NEEDS_HUMAN_REVIEW
        for task in tasks
    )

    failed = sum(
        task.status == STATUS_FAILED
        for task in tasks
    )

    # ------------------------------------------------------------
    # Legacy compatibility statuses
    # ------------------------------------------------------------

    ready_for_review = sum(
        task.status == STATUS_READY_FOR_REVIEW
        for task in tasks
    )

    submitted = sum(
        task.status == STATUS_SUBMITTED
        for task in tasks
    )

    changes_requested = sum(
        task.status == STATUS_CHANGES_REQUESTED
        for task in tasks
    )

    # ------------------------------------------------------------
    # Progress
    #
    # Progress is based on REQUIRED tasks.
    # ------------------------------------------------------------

    completed_required = sum(
        task.status == STATUS_COMPLETED
        and bool(task.required)
        for task in tasks
    )

    progress = (
        round(
            (completed_required / required_tasks) * 100,
            2,
        )
        if required_tasks
        else 0.0
    )

    # ------------------------------------------------------------
    # Overall onboarding status
    # ------------------------------------------------------------

    if required_tasks == 0:

        onboarding_status = "not_started"

    elif completed_required == required_tasks:

        onboarding_status = "completed"

    elif needs_human_review > 0:

        onboarding_status = "needs_human_review"

    elif waiting_for_student > 0:

        onboarding_status = "waiting_for_student"

    elif failed > 0:

        onboarding_status = "failed"

    elif processing > 0:

        onboarding_status = "processing"

    elif in_progress > 0:

        onboarding_status = "in_progress"

    else:

        onboarding_status = "pending"

    # ------------------------------------------------------------
    # Response
    # ------------------------------------------------------------

    return {
        "student_id": student_id,

        # Overall task counts
        "total_tasks": total,
        "required_tasks": required_tasks,

        # Completion
        "completed_tasks": completed,
        "completed_required_tasks": completed_required,

        # Other statuses
        "pending_tasks": pending,
        "in_progress_tasks": in_progress,
        "waiting_for_student_tasks": waiting_for_student,
        "processing_tasks": processing,
        "needs_human_review_tasks": needs_human_review,
        "failed_tasks": failed,

        # Compatibility
        "ready_for_review_tasks": ready_for_review,
        "submitted_tasks": submitted,
        "changes_requested_tasks": changes_requested,

        # Progress
        "progress_percentage": progress,

        # Overall state
        "onboarding_status": onboarding_status,
    }


# INITIALIZE


def initialize_student_onboarding(
    db: Session,
    student_id: int,
    organization_id: int,
):

    student = _get_student_in_org(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    if student.admission_status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Onboarding requires confirmed admission."
            ),
        )

    created = 0
    skipped = 0

    for definition in DEFAULT_TASKS:

        existing = _get_task_by_key(
            db=db,
            student_id=student.id,
            task_key=definition["task_key"],
        )

        if existing:
            skipped += 1
            continue

        task = OnboardingTask(
            student_id=student.id,
            task_key=definition["task_key"],
            title=definition["title"],
            description=definition["description"],
            required=definition["required"],
            status=STATUS_PENDING,
        )

        db.add(task)

        created += 1

    return {
        "student_id": student.id,
        "tasks_created": created,
        "tasks_skipped": skipped,
        "message": (
            "Onboarding tasks initialized automatically."
        ),
    }



# NEXT ACTION


def get_next_onboarding_action(
    db: Session,
    student_id: int,
    organization_id: int,
):

    _get_student_in_org(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    tasks = _get_student_tasks(
        db=db,
        student_id=student_id,
    )

    # Student action gets priority.
    student_action_states = {
        STATUS_WAITING_FOR_STUDENT,
        STATUS_IN_PROGRESS,
        STATUS_PENDING,
    }

    for task in tasks:

        if task.status in student_action_states:

            return {
                "student_id": student_id,
                "has_next_action": True,
                "next_action": {
                    "task_id": task.id,
                    "task_key": task.task_key,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                },
                "message": (
                    f"Action required: {task.title}"
                ),
            }

    # Human exception.
    for task in tasks:

        if task.status == STATUS_NEEDS_HUMAN_REVIEW:

            return {
                "student_id": student_id,
                "has_next_action": False,
                "next_action": None,
                "message": (
                    "Your onboarding contains an item "
                    "requiring college staff review."
                ),
            }

    # Processing.
    if any(
        task.status == STATUS_PROCESSING
        for task in tasks
    ):

        return {
            "student_id": student_id,
            "has_next_action": False,
            "next_action": None,
            "message": (
                "CampusFlow is automatically processing "
                "your onboarding."
            ),
        }

    return {
        "student_id": student_id,
        "has_next_action": False,
        "next_action": None,
        "message": (
            "All onboarding tasks are completed."
        ),
    }



# AUTOMATIC COMPLETION


def auto_complete_task(
    db: Session,
    task_id: int,
    organization_id: int,
    reason: str,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status == STATUS_COMPLETED:
        return task

    task.status = STATUS_PROCESSING

    task.reviewed_at = None
    task.reviewed_by_user_id = None

    task.review_notes = reason

    db.flush()

    # ------------------------------------------------------------
    # Academic Registration
    # ------------------------------------------------------------

    if task.task_key == "academic_registration":

        student = _get_student_in_org(
            db=db,
            student_id=task.student_id,
            organization_id=organization_id,
        )

        if not student.department:
            task.status = STATUS_WAITING_FOR_STUDENT

            task.review_notes = (
                "Department information is required "
                "for automatic academic registration."
            )

            db.flush()

            return task

        if not student.roll_number:

            registration_year = datetime.utcnow().year

            if student.academic_year:

                try:
                    registration_year = int(
                        str(student.academic_year)[:4]
                    )
                except (
                    ValueError,
                    TypeError,
                ):
                    registration_year = datetime.utcnow().year

            student.roll_number = generate_roll_number(
                db=db,
                organization_id=organization_id,
                department_code=student.department,
                year=registration_year,
            )

    # ------------------------------------------------------------
    # Library Registration
    # ------------------------------------------------------------

    elif task.task_key == "library_registration":

        # The current CampusFlow data model does not have a
        # separate library table/service yet.
        #
        # Therefore the onboarding registration itself is marked
        # completed automatically.
        #
        # A real library integration can be plugged in later
        # without changing the onboarding workflow.
        pass

    # ------------------------------------------------------------
    # ID Card Registration
    # ------------------------------------------------------------

    elif task.task_key == "id_card_registration":

        # ID-card registration is allowed to complete only after
        # the onboarding agent has verified the required photo.
        pass

    # ------------------------------------------------------------
    # Complete
    # ------------------------------------------------------------

    task.status = STATUS_COMPLETED

    task.completed_at = datetime.utcnow()

    task.updated_at = datetime.utcnow()

    db.flush()

    return task



# WAIT FOR STUDENT


def mark_waiting_for_student(
    db: Session,
    task_id: int,
    organization_id: int,
    reason: str,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status == STATUS_COMPLETED:
        return task

    task.status = STATUS_WAITING_FOR_STUDENT

    task.completed_at = None

    task.review_notes = reason

    task.updated_at = datetime.utcnow()

    db.flush()

    return task



# HUMAN REVIEW REQUIRED


def mark_needs_human_review(
    db: Session,
    task_id: int,
    organization_id: int,
    reason: str,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status == STATUS_COMPLETED:
        return task

    task.status = STATUS_NEEDS_HUMAN_REVIEW

    task.completed_at = None

    task.review_notes = reason

    task.updated_at = datetime.utcnow()

    db.flush()

    return task



# ADMIN QUEUE


def get_admin_onboarding_queue(
    db: Session,
    organization_id: int,
):

    rows = (
        db.query(
            OnboardingTask,
            Student,
        )
        .join(
            Student,
            OnboardingTask.student_id == Student.id,
        )
        .filter(
            Student.organization_id == organization_id,
            OnboardingTask.status == STATUS_NEEDS_HUMAN_REVIEW,
        )
        .order_by(
            OnboardingTask.created_at.asc()
        )
        .all()
    )

    result = []

    for task, student in rows:

        summary = get_onboarding_summary(
            db=db,
            student_id=student.id,
            organization_id=organization_id,
        )

        result.append(
            {
                "task_id": task.id,
                "student_id": student.id,
                "student_name": student.full_name,
                "email": student.email,
                "phone": student.phone,
                "application_number": student.application_number,
                "admission_number": student.admission_number,
                "roll_number": student.roll_number,
                "program": student.program,
                "department": student.department,
                "academic_year": student.academic_year,
                "semester": student.semester,

                "task_key": task.task_key,
                "task_title": task.title,
                "task_description": task.description,
                "required": task.required,
                "status": task.status,

                "submitted_at": task.submitted_at,
                "completed_at": task.completed_at,
                "reviewed_at": task.reviewed_at,
                "review_notes": task.review_notes,

                "total_tasks": summary["total_tasks"],
                "completed_tasks": summary["completed_tasks"],
                "pending_tasks": summary["pending_tasks"],
                "in_progress_tasks": summary["in_progress_tasks"],
                "waiting_for_student_tasks": (
                    summary["waiting_for_student_tasks"]
                ),
                "processing_tasks": summary["processing_tasks"],
                "needs_human_review_tasks": (
                    summary["needs_human_review_tasks"]
                ),
                "failed_tasks": summary["failed_tasks"],

                "progress_percentage": (
                    summary["progress_percentage"]
                ),
            }
        )

    return result



# HUMAN EXCEPTION APPROVAL


def approve_onboarding_task(
    db: Session,
    task_id: int,
    organization_id: int,
    reviewer_id: int,
    notes: Optional[str] = None,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status == STATUS_COMPLETED:
        return task

    if task.status != STATUS_NEEDS_HUMAN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This task does not currently require "
                "human approval."
            ),
        )

    task.status = STATUS_COMPLETED

    task.completed_at = datetime.utcnow()

    task.reviewed_at = datetime.utcnow()

    task.reviewed_by_user_id = reviewer_id

    task.review_notes = (
        notes
        or task.review_notes
        or "Approved by staff after exception review."
    )

    db.commit()
    db.refresh(task)

    return task



# HUMAN REQUEST CHANGES


def request_onboarding_changes(
    db: Session,
    task_id: int,
    organization_id: int,
    reviewer_id: int,
    notes: Optional[str] = None,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status != STATUS_NEEDS_HUMAN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This task is not waiting for human review."
            ),
        )

    task.status = STATUS_WAITING_FOR_STUDENT

    task.reviewed_at = datetime.utcnow()

    task.reviewed_by_user_id = reviewer_id

    task.review_notes = (
        notes
        or "Please provide the requested correction."
    )

    db.commit()
    db.refresh(task)

    return task



# LEGACY DIRECT COMPLETION


def complete_onboarding_task(
    db: Session,
    task_id: int,
    organization_id: int,
):

    task = _get_task_in_org(
        db=db,
        task_id=task_id,
        organization_id=organization_id,
    )

    if task.status == STATUS_COMPLETED:
        return task

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            "Direct completion is disabled. "
            "Normal tasks are completed automatically by "
            "the onboarding automation agent."
        ),
    )



# LEGACY SPECIAL FUNCTIONS


def complete_academic_registration(
    db: Session,
    student_id: int,
    organization_id: int,
):

    task = _get_task_by_key(
        db=db,
        student_id=student_id,
        task_key="academic_registration",
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic registration task not found.",
        )

    return task


def complete_library_registration(
    db: Session,
    student_id: int,
    organization_id: int,
):

    task = _get_task_by_key(
        db=db,
        student_id=student_id,
        task_key="library_registration",
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library registration task not found.",
        )

    return task


def complete_id_card_registration(
    db: Session,
    student_id: int,
    organization_id: int,
):

    task = _get_task_by_key(
        db=db,
        student_id=student_id,
        task_key="id_card_registration",
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ID card registration task not found.",
        )

    return task