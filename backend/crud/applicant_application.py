from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.applicant_application import ApplicantApplication
from schemas.applicant_application import ApplicantApplicationUpdate



# GET APPLICATION


def get_applicant_application(
    db: Session,
    student_id: int,
    organization_id: int,
) -> ApplicantApplication:
    """
    Retrieve an applicant application using the student ID
    and organization ID.
    """

    application = (
        db.query(ApplicantApplication)
        .filter(
            ApplicantApplication.student_id == student_id,
            ApplicantApplication.organization_id == organization_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant application not found.",
        )

    return application



# COMPLETION CALCULATION


def calculate_completion_percentage(
    application: ApplicantApplication,
) -> int:
    """
    Calculate application completion percentage.

    All listed academic and personal fields are required.
    JEE information is required only when jee_attempted is True.
    """

    required_fields = [
        application.date_of_birth,
        application.gender,
        application.category,
        application.nationality,

        application.father_name,
        application.mother_name,

        application.address_line,
        application.city,
        application.district,
        application.state,
        application.pincode,

        application.tenth_school_name,
        application.tenth_board,
        application.tenth_passing_year,
        application.tenth_roll_number,
        application.tenth_percentage,

        application.twelfth_school_name,
        application.twelfth_board,
        application.twelfth_stream,
        application.twelfth_passing_year,
        application.twelfth_roll_number,
        application.twelfth_percentage,
    ]

    completed = sum(
        1
        for value in required_fields
        if value is not None
        and str(value).strip() != ""
    )

    total = len(required_fields)

    # JEE details are conditionally required.
    if application.jee_attempted is True:
        jee_fields = [
            application.jee_year,
            application.jee_percentile,
            application.jee_rank,
        ]

        completed += sum(
            1
            for value in jee_fields
            if value is not None
            and str(value).strip() != ""
        )

        total += len(jee_fields)

    if total == 0:
        return 0

    return min(
        100,
        round((completed / total) * 100),
    )



# UPDATE APPLICATION


def update_applicant_application(
    db: Session,
    application: ApplicantApplication,
    data: ApplicantApplicationUpdate,
) -> ApplicantApplication:
    """
    Update an existing draft application.

    The router is responsible for retrieving the application
    belonging to the authenticated student and organization.
    """

    # Only draft applications can be edited.
    if application.status in (
        "submitted",
        "approved",
        "rejected",
        "confirmed",
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This application can no longer be edited.",
        )

    update_data = data.model_dump(exclude_unset=True)

    # Update only fields that exist on the model.
    for field, value in update_data.items():
        if hasattr(application, field):
            setattr(application, field, value)

    # Recalculate completion.
    application.completion_percentage = (
        calculate_completion_percentage(application)
    )

    application.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(application)
    except Exception:
        db.rollback()
        raise

    return application



# SUBMIT APPLICATION


def submit_applicant_application(
    db: Session,
    application: ApplicantApplication,
) -> ApplicantApplication:
    """
    Submit an existing application after validating completion.
    """

    # Prevent duplicate submissions.
    if application.status in (
        "submitted",
        "approved",
        "rejected",
        "confirmed",
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This application has already been processed "
                "and cannot be submitted again."
            ),
        )

    # Recalculate completion before submission.
    application.completion_percentage = (
        calculate_completion_percentage(application)
    )

    # Require complete application information.
    if application.completion_percentage < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Please complete all required application "
                "information before submitting."
            ),
        )

    # Update submission details.
    application.status = "submitted"
    application.submitted_at = datetime.utcnow()
    application.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(application)
    except Exception:
        db.rollback()
        raise

    return application