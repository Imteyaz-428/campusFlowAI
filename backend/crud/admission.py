from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.admission import Admission
from models.student import Student

from schemas.admission import (
    AdmissionCreate,
    AdmissionUpdate,
    AdmissionEligibilityReview,
)



# STUDENT ORGANIZATION LOOKUP


def _get_student_in_org(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Resolve a student while enforcing organization isolation.
    """

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



# CREATE ADMISSION


def create_admission(
    db: Session,
    admission_data: AdmissionCreate,
    organization_id: int,
    commit: bool = True,
):
    """
    Create an admission record for a student.

    commit=True
        Normal admission API usage.

    commit=False
        Used when admission is automatically created while
        creating a student application.

        In that case the caller controls the final commit.
    """

  
    # VERIFY STUDENT BELONGS TO ORGANIZATION
  

    student = _get_student_in_org(
        db=db,
        student_id=admission_data.student_id,
        organization_id=organization_id,
    )

  
    # NORMALIZE APPLICATION NUMBER
  

    normalized_application_number = (
        admission_data.application_number
        .strip()
        .upper()
    )

  
    # VERIFY APPLICATION NUMBER MATCHES STUDENT
  

    if student.application_number != normalized_application_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Application number does not match "
                "the selected student."
            ),
        )

  
    # CHECK DUPLICATE ADMISSION
  

    existing = (
        db.query(Admission)
        .filter(
            Admission.organization_id == organization_id,
            Admission.application_number
            == normalized_application_number,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An admission record already exists "
                "for this application number."
            ),
        )

  
    # CREATE ADMISSION
  

    admission = Admission(
        organization_id=organization_id,
        student_id=student.id,
        application_number=normalized_application_number,
        program=admission_data.program.strip(),
        admission_type=admission_data.admission_type.strip(),
        status=admission_data.status.strip().lower(),
        application_date=(
            admission_data.application_date
            or date.today()
        ),
        remarks=(
            admission_data.remarks.strip()
            if admission_data.remarks
            else None
        ),
    )

    db.add(admission)

  
    # FLUSH
  

    try:
        db.flush()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Unable to create admission because "
                "a unique value already exists."
            ),
        )

  
    # COMMIT ONLY WHEN REQUESTED
  

    if commit:
        db.commit()
        db.refresh(admission)

    return admission



# GET ALL ADMISSIONS


def get_admissions(
    db: Session,
    organization_id: int,
):
    """
    Return admissions belonging only to the current organization.
    """

    return (
        db.query(Admission)
        .join(
            Student,
            Admission.student_id == Student.id,
        )
        .filter(
            Admission.organization_id == organization_id,
            Student.organization_id == organization_id,
        )
        .order_by(
            Admission.id.desc()
        )
        .all()
    )



# GET ADMISSION BY ID


def get_admission_by_id(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Organization-scoped admission lookup.
    """

    admission = (
        db.query(Admission)
        .join(
            Student,
            Admission.student_id == Student.id,
        )
        .filter(
            Admission.id == admission_id,
            Admission.organization_id == organization_id,
            Student.organization_id == organization_id,
        )
        .first()
    )

    if admission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission not found.",
        )

    return admission



# GET ADMISSION BY STUDENT


def get_admission_by_student(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get the latest admission record for a student.
    """

    _get_student_in_org(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    admission = (
        db.query(Admission)
        .filter(
            Admission.student_id == student_id,
            Admission.organization_id == organization_id,
        )
        .order_by(
            Admission.id.desc()
        )
        .first()
    )

    if admission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission record not found.",
        )

    return admission



# UPDATE ADMISSION


def update_admission(
    db: Session,
    admission_id: int,
    admission_data: AdmissionUpdate,
    organization_id: int,
):
    """
    Update editable admission information.

    Workflow-controlled fields are intentionally excluded.

    Protected fields:

        organization_id
        student_id
        application_number
        status
        eligibility_status
        eligibility_reason
        reviewed_by_user_id
        reviewed_at
        decision_at

    These fields must only be changed by their dedicated
    admission workflow services.
    """

    admission = get_admission_by_id(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )

    update_data = admission_data.model_dump(
        exclude_unset=True
    )

    allowed_fields = {
        "program",
        "admission_type",
        "remarks",
    }

    for key, value in update_data.items():

        if key not in allowed_fields:
            continue

        if isinstance(value, str):
            value = value.strip()

        setattr(
            admission,
            key,
            value,
        )

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Admission update violates a "
                "database constraint."
            ),
        )

    db.refresh(admission)

    return admission


# ADMIN — REVIEW ADMISSION ELIGIBILITY


def review_admission_eligibility(
    db: Session,
    admission_id: int,
    review_data: AdmissionEligibilityReview,
    organization_id: int,
    reviewed_by_user_id: int,
):
    """
    Record the administrator's eligibility decision.

    eligible:
        admission.status = approved

    not_eligible:
        admission.status = rejected
    """

    admission = get_admission_by_id(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )

  
    # NORMALIZE STATUS
  

    eligibility_status = (
        review_data.eligibility_status
        .strip()
        .lower()
    )

    allowed_statuses = {
        "eligible",
        "not_eligible",
    }

    if eligibility_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid eligibility status. "
                "Allowed values: eligible, not_eligible."
            ),
        )

  
    # PREVENT REVIEW OF FINALIZED ADMISSION
  

    if admission.status in {
        "confirmed",
        "rejected",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This admission can no longer be reviewed "
                "because it has already been finalized."
            ),
        )

  
    # UPDATE ELIGIBILITY
  

    admission.eligibility_status = eligibility_status

    admission.eligibility_reason = (
        review_data.eligibility_reason.strip()
        if review_data.eligibility_reason
        else None
    )

    admission.reviewed_by_user_id = reviewed_by_user_id

    admission.reviewed_at = datetime.utcnow()

    admission.decision_at = datetime.utcnow()

    if review_data.remarks:
        admission.remarks = review_data.remarks.strip()

  
    # UPDATE ADMISSION STATUS
  

    if eligibility_status == "eligible":
        admission.status = "approved"
    else:
        admission.status = "rejected"

  
    # SAVE
  

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to save admission eligibility review.",
        )

    db.refresh(admission)

    return admission