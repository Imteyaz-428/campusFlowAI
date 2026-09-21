from sqlalchemy.orm import Session

from crud.admission import (
    create_admission,
    get_admission_by_id,
    get_admission_by_student,
    get_admissions,
    review_admission_eligibility,
    update_admission,
)

from schemas.admission import (
    AdmissionCreate,
    AdmissionEligibilityReview,
    AdmissionUpdate,
)



# CREATE ADMISSION


def create_admission_service(
    db: Session,
    admission_data: AdmissionCreate,
    organization_id: int,
):
    """
    Create an admission record for a student.

    Organization isolation is enforced by the CRUD layer.
    """

    return create_admission(
        db=db,
        admission_data=admission_data,
        organization_id=organization_id,
    )



# LIST ADMISSIONS


def list_admissions_service(
    db: Session,
    organization_id: int,
):
    """
    Return all admissions belonging to the current organization.
    """

    return get_admissions(
        db=db,
        organization_id=organization_id,
    )



# GET ADMISSION BY ID


def get_admission_service(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Get one admission while enforcing organization isolation.
    """

    return get_admission_by_id(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )



# GET ADMISSION BY STUDENT


def get_student_admission_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get the admission record belonging to a student.

    Organization isolation is enforced by the CRUD layer.
    """

    return get_admission_by_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# UPDATE ADMISSION


def update_admission_service(
    db: Session,
    admission_id: int,
    admission_data: AdmissionUpdate,
    organization_id: int,
):
    """
    Update general admission information.

    Eligibility decisions should NOT be performed through
    this function.

    They must use the dedicated eligibility-review workflow.
    """

    return update_admission(
        db=db,
        admission_id=admission_id,
        admission_data=admission_data,
        organization_id=organization_id,
    )



# ADMIN — REVIEW ADMISSION ELIGIBILITY


def review_admission_eligibility_service(
    db: Session,
    admission_id: int,
    review_data: AdmissionEligibilityReview,
    organization_id: int,
    reviewed_by_user_id: int,
):
    """
    Record the administrator's admission eligibility decision.

    Workflow:

        Admission
             ↓
        ADMIN reviews eligibility
             ↓
        ┌───────────────┐
        │               │
        ▼               ▼
      eligible      not_eligible
        │               │
        ▼               ▼
     approved        rejected

    The CRUD layer records:

        - eligibility_status
        - eligibility_reason
        - reviewed_by_user_id
        - reviewed_at
        - decision_at
        - remarks
    """

    return review_admission_eligibility(
        db=db,
        admission_id=admission_id,
        review_data=review_data,
        organization_id=organization_id,
        reviewed_by_user_id=reviewed_by_user_id,
    )