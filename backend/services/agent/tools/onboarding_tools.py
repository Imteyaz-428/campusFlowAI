from sqlalchemy.orm import Session

from services.campus.onboarding_service import (
    get_student_onboarding_service,
    get_onboarding_summary_service,
    get_next_onboarding_action_service,
    complete_onboarding_task_service,
    get_onboarding_task_service,
    complete_academic_registration_service,
    complete_library_registration_service,
    complete_id_card_registration_service,
)



# READ TOOLS


def get_onboarding_tasks_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Get all onboarding tasks for a student.
    """

    tasks = get_student_onboarding_service(
        db,
        student_id,
        organization_id
    )

    return [
        {
            "task_id": task.id,
            "task_key": task.task_key,
            "title": task.title,
            "description": task.description,
            "required": task.required,
            "status": task.status,
            "due_date": (
                task.due_date.isoformat()
                if task.due_date
                else None
            ),
        }
        for task in tasks
    ]


def get_onboarding_summary_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Get onboarding completion summary for a student.
    """

    return get_onboarding_summary_service(
        db,
        student_id,
        organization_id
    )


def get_next_onboarding_action_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Get the next pending onboarding action for a student.
    """

    return get_next_onboarding_action_service(
        db,
        student_id,
        organization_id
    )



# GENERIC ONBOARDING TOOL


def complete_onboarding_task_tool(
    db: Session,
    student_id: int,
    task_id: int,
    organization_id: int
):
    """
    Complete a generic onboarding task.

    Security:
        - Task must belong to the student.
        - Task lookup is organization-scoped.
    """

    task = get_onboarding_task_service(
        db,
        task_id,
        organization_id
    )

    if task.student_id != student_id:
        raise PermissionError(
            "You are not authorized to modify this onboarding task."
        )

    if task.status == "completed":
        return {
            "success": True,
            "already_completed": True,
            "task_id": task.id,
            "task_key": task.task_key,
            "title": task.title,
            "status": task.status,
            "message": f"{task.title} is already completed."
        }

    completed_task = complete_onboarding_task_service(
        db,
        task_id,
        organization_id
    )

    return {
        "success": True,
        "already_completed": False,
        "task_id": completed_task.id,
        "task_key": completed_task.task_key,
        "title": completed_task.title,
        "status": completed_task.status,
        "message": f"{completed_task.title} completed successfully."
    }



# SPECIALIZED ONBOARDING TOOLS


def complete_academic_registration_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Complete academic registration for a confirmed student.

    This is a specialized business operation.

    It:
        - verifies admission confirmation
        - completes academic registration
        - generates the student's roll number
    """

    task = complete_academic_registration_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id
    )

    return {
        "success": True,
        "task_id": task.id,
        "task_key": task.task_key,
        "title": task.title,
        "status": task.status,
        "completed_at": (
            task.completed_at.isoformat()
            if task.completed_at
            else None
        ),
        "message": (
            "Academic registration completed successfully. "
            "The student's roll number has been generated."
        )
    }


def complete_library_registration_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Complete library registration for a confirmed student.
    """

    task = complete_library_registration_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id
    )

    return {
        "success": True,
        "task_id": task.id,
        "task_key": task.task_key,
        "title": task.title,
        "status": task.status,
        "completed_at": (
            task.completed_at.isoformat()
            if task.completed_at
            else None
        ),
        "message": (
            "Library registration completed successfully."
        )
    }


def complete_id_card_registration_tool(
    db: Session,
    student_id: int,
    organization_id: int
):
    """
    Complete ID card registration for a confirmed student.
    """

    task = complete_id_card_registration_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id
    )

    return {
        "success": True,
        "task_id": task.id,
        "task_key": task.task_key,
        "title": task.title,
        "status": task.status,
        "completed_at": (
            task.completed_at.isoformat()
            if task.completed_at
            else None
        ),
        "message": (
            "ID card registration completed successfully."
        )
    }