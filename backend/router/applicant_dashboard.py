from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_applicant
from dependencies.database import get_db

from models.student import Student

from schemas.applicant_dashboard import (
    ApplicantDashboardResponse,
)

from services.campus.applicant_dashboard_service import (
    get_applicant_dashboard_service,
)


router = APIRouter(
    prefix="/campus/applicant",
    tags=["Campus - Applicant Portal"],
)



# APPLICANT DASHBOARD


@router.get(
    "/dashboard",
    response_model=ApplicantDashboardResponse,
)
def get_applicant_dashboard(
    db: Session = Depends(get_db),
    current_applicant: Student = Depends(
        get_current_applicant
    ),
):
    """
    Return the dashboard of the currently authenticated applicant.

    Authentication:

        Applicant JWT

    Identity:

        Applicant JWT -> Student.id

    The frontend does NOT provide:

        student_id
        organization_id

    The backend resolves both values from the authenticated
    applicant.
    """

    return get_applicant_dashboard_service(
        db=db,
        student=current_applicant,
    )