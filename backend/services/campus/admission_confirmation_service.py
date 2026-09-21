from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.admission import Admission
from models.fee import Fee
from models.student import Student

from core.id_generator import (
    generate_admission_number,
    generate_roll_number,
)

from services.student_account.activation_service import (
    activate_student_account,
)


def confirm_admission_service(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Confirm an approved admission after all mandatory fees are paid.

    Workflow:

        APPROVED
            ↓
        Mandatory fee check
            ↓
        All mandatory fees PAID
            ↓
        ADMISSION CONFIRMED
            ↓
        Generate admission number
            ↓
        Generate roll number
            ↓
        Create STUDENT User account
            ↓
        Link Student.user_id
            ↓
        Student can start onboarding
            ↓
        Commit transaction

    IMPORTANT:

    Onboarding is NOT initialized here.

    The student explicitly starts onboarding from the student
    dashboard after admission has been confirmed.

    This keeps the onboarding lifecycle separate from admission
    confirmation and allows the student to explicitly initiate
    the onboarding process.
    """

   
    # 1. GET ADMISSION
   

    admission = db.scalar(
        select(Admission)
        .where(
            Admission.id == admission_id,
            Admission.organization_id == organization_id,
        )
        .with_for_update()
    )

    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission not found.",
        )

   
    # 2. ADMISSION MUST BE APPROVED
   

    if admission.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Admission cannot be confirmed because its current "
                f"status is '{admission.status}'. "
                f"Only approved admissions can be confirmed."
            ),
        )

   
    # 3. GET STUDENT
   

    student = db.scalar(
        select(Student).where(
            Student.id == admission.student_id,
            Student.organization_id == organization_id,
        )
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found for this admission.",
        )

   
    # 4. GET MANDATORY FEES
   

    mandatory_fees = db.scalars(
        select(Fee).where(
            Fee.admission_id == admission.id,
            Fee.organization_id == organization_id,
            Fee.is_mandatory == "true",
        )
    ).all()

   
    # 5. MANDATORY FEES MUST EXIST
   

    if not mandatory_fees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No mandatory fee has been created "
                "for this admission."
            ),
        )

   
    # 6. ALL MANDATORY FEES MUST BE PAID
   

    unpaid_fees = [
        fee
        for fee in mandatory_fees
        if str(fee.status).lower() != "paid"
    ]

    if unpaid_fees:

        unpaid_types = ", ".join(
            fee.fee_type
            for fee in unpaid_fees
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Admission cannot be confirmed because mandatory "
                f"fees are still unpaid: {unpaid_types}"
            ),
        )

   
    # 7. GENERATE ADMISSION NUMBER
   

    if student.admission_number:

        admission_number = student.admission_number

    else:

        admission_number = generate_admission_number(
            db=db,
            organization_id=organization_id,
        )

   
    # 8. GENERATE ROLL NUMBER
   

    if student.roll_number:

        roll_number = student.roll_number

    elif student.department:

        registration_year = datetime.utcnow().year

        if student.academic_year:

            try:

                registration_year = int(
                    str(student.academic_year)[:4]
                )

            except (ValueError, TypeError):

                registration_year = datetime.utcnow().year

        roll_number = generate_roll_number(
            db=db,
            organization_id=organization_id,
            department_code=student.department,
            year=registration_year,
        )

    else:

        roll_number = None

   
    # 9. CONFIRM ADMISSION
   

    admission.status = "confirmed"

    admission.decision_at = datetime.utcnow()

   
    # 10. UPDATE STUDENT LIFECYCLE
   

    student.admission_number = admission_number

    student.admission_status = "confirmed"

    student.status = "active"

    if roll_number:

        student.roll_number = roll_number

   
    # 11. CREATE / ACTIVATE STUDENT ACCOUNT
   
    #
    # The applicant password hash is reused so the student
    # can continue using the password selected during
    # application.
    #
    # commit=False is important because admission confirmation,
    # student activation and account creation should be committed
    # together.
   

    activate_student_account(
        db=db,
        student=student,
        commit=False,
    )

   
    # 12. DO NOT INITIALIZE ONBOARDING HERE
   
    #
    # Onboarding is explicitly started by the student.
    #
    # Student workflow:
    #
    #     Login
    #       ↓
    #     Dashboard
    #       ↓
    #     Start Onboarding
    #       ↓
    #     /campus/onboarding/me/initialize
    #
    # This prevents onboarding tasks from being created
    # automatically during admission confirmation.
   

   
    # 13. ATOMIC COMMIT
   

    try:

        db.commit()

        db.refresh(admission)

        db.refresh(student)

    except Exception:

        db.rollback()

        raise

   
    # 14. RETURN CONFIRMED ADMISSION
   

    return admission