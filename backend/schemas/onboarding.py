from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field



# STATUS VALUES


ONBOARDING_STATUSES = {
    "pending",
    "in_progress",
    "waiting_for_student",
    "processing",
    "completed",
    "needs_human_review",
    "failed",

    # Legacy compatibility
    "ready_for_review",
    "submitted",
    "changes_requested",
}



# CREATE


class OnboardingTaskCreate(BaseModel):
    student_id: int

    task_key: str = Field(
        min_length=2,
        max_length=100,
    )

    title: str = Field(
        min_length=2,
        max_length=200,
    )

    description: Optional[str] = None

    required: bool = True

    status: str = "pending"

    due_date: Optional[datetime] = None



# UPDATE


class OnboardingTaskUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    description: Optional[str] = None

    required: Optional[bool] = None

    due_date: Optional[datetime] = None



# TASK RESPONSE


class OnboardingTaskResponse(BaseModel):
    id: int

    student_id: int

    task_key: str

    title: str

    description: Optional[str]

    required: bool

    status: str

    due_date: Optional[datetime]

    submitted_at: Optional[datetime]

    completed_at: Optional[datetime]

    reviewed_at: Optional[datetime]

    reviewed_by_user_id: Optional[int]

    review_notes: Optional[str]

    created_at: Optional[datetime]

    updated_at: Optional[datetime]

    class Config:
        from_attributes = True



# SUMMARY


class OnboardingSummary(BaseModel):
    student_id: int

    total_tasks: int

    completed_tasks: int

    pending_tasks: int

    in_progress_tasks: int

    waiting_for_student_tasks: int = 0

    processing_tasks: int = 0

    needs_human_review_tasks: int = 0

    failed_tasks: int = 0

    # Legacy fields
    ready_for_review_tasks: int = 0

    submitted_tasks: int = 0

    changes_requested_tasks: int = 0

    progress_percentage: float

    onboarding_status: str



# INITIALIZATION


class OnboardingInitializeResponse(BaseModel):
    student_id: int

    tasks_created: int

    tasks_skipped: int

    message: str



# NEXT ACTION


class OnboardingNextAction(BaseModel):
    task_id: int

    task_key: str

    title: str

    description: Optional[str] = None

    status: str


class OnboardingNextActionResponse(BaseModel):
    student_id: int

    has_next_action: bool

    next_action: Optional[OnboardingNextAction] = None

    message: str



# STUDENT ACTION


class OnboardingStudentActionRequest(BaseModel):
    notes: Optional[str] = Field(
        default=None,
        max_length=5000,
    )



# HUMAN REVIEW


class OnboardingReviewRequest(BaseModel):
    notes: Optional[str] = Field(
        default=None,
        max_length=5000,
    )



# ADMIN / EXCEPTION QUEUE


class OnboardingAdminQueueItem(BaseModel):
    task_id: int

    student_id: int

    student_name: str

    email: Optional[str] = None

    phone: Optional[str] = None

    application_number: Optional[str] = None

    admission_number: Optional[str] = None

    roll_number: Optional[str] = None

    program: Optional[str] = None

    department: Optional[str] = None

    academic_year: Optional[str] = None

    semester: Optional[str] = None

    task_key: str

    task_title: str

    task_description: Optional[str] = None

    required: bool

    status: str

    submitted_at: Optional[datetime] = None

    completed_at: Optional[datetime] = None

    reviewed_at: Optional[datetime] = None

    review_notes: Optional[str] = None

    total_tasks: int = 0

    completed_tasks: int = 0

    pending_tasks: int = 0

    in_progress_tasks: int = 0

    waiting_for_student_tasks: int = 0

    processing_tasks: int = 0

    needs_human_review_tasks: int = 0

    failed_tasks: int = 0

    progress_percentage: float = 0



# AUTOMATION RESULT


class OnboardingAutomationResponse(BaseModel):
    student_id: int

    tasks_processed: int

    tasks_auto_completed: int

    tasks_waiting_for_student: int

    tasks_needing_human_review: int

    tasks_failed: int

    onboarding_status: str

    message: str