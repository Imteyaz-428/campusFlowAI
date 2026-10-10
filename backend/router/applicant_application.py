from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_applicant
from dependencies.database import get_db

from models.student import Student
from models.applicant_application import ApplicantApplication

from schemas.applicant_application import (
    ApplicantApplicationResponse,
    ApplicantApplicationUpdate,
)

from crud.applicant_application import (
    get_applicant_application,
    update_applicant_application,
    submit_applicant_application,
)


router = APIRouter(
    prefix="/campus/applicant/application",
    tags=["Applicant - Application"],
)


# ============================================================
# GET MY APPLICATION
# ============================================================

@router.get(
    "",
    response_model=ApplicantApplicationResponse,
)
def get_my_application(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_applicant
    ),
):
    """
    Get the logged-in applicant's application.

    If no application exists yet, create a draft.
    """

    application = (
        db.query(ApplicantApplication)
        .filter(
            ApplicantApplication.student_id
            == current_student.id,
            ApplicantApplication.organization_id
            == current_student.organization_id,
        )
        .first()
    )

    # --------------------------------------------------------
    # CREATE INITIAL DRAFT
    # --------------------------------------------------------

    if application is None:

        application = ApplicantApplication(
            student_id=current_student.id,
            organization_id=current_student.organization_id,
            status="draft",
            completion_percentage=0,
        )

        db.add(application)
        db.commit()
        db.refresh(application)

    return application


# ============================================================
# UPDATE / SAVE DRAFT
# ============================================================

@router.put(
    "",
    response_model=ApplicantApplicationResponse,
)
def update_my_application(
    data: ApplicantApplicationUpdate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_applicant
    ),
):
    application = (
        db.query(ApplicantApplication)
        .filter(
            ApplicantApplication.student_id
            == current_student.id,
            ApplicantApplication.organization_id
            == current_student.organization_id,
        )
        .first()
    )

    if application is None:
        application = ApplicantApplication(
            student_id=current_student.id,
            organization_id=current_student.organization_id,
            status="draft",
            completion_percentage=0,
        )

        db.add(application)
        db.commit()
        db.refresh(application)

    return update_applicant_application(
        db=db,
        application=application,
        data=data,
    )


# ============================================================
# SUBMIT APPLICATION
# ============================================================

@router.post(
    "/submit",
    response_model=ApplicantApplicationResponse,
)
def submit_my_application(
    db: Session = Depends(get_db),
    current_student: Student = Depends(
        get_current_applicant
    ),
):
    application = (
        db.query(ApplicantApplication)
        .filter(
            ApplicantApplication.student_id
            == current_student.id,
            ApplicantApplication.organization_id
            == current_student.organization_id,
        )
        .first()
    )

    if application is None:
        application = ApplicantApplication(
            student_id=current_student.id,
            organization_id=current_student.organization_id,
            status="draft",
            completion_percentage=0,
        )

        db.add(application)
        db.commit()
        db.refresh(application)

    return submit_applicant_application(
        db=db,
        application=application,
    )