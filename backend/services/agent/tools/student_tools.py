from sqlalchemy.orm import Session

from crud.student import get_student_by_id
from crud.admission import get_admission_by_student



# GET STUDENT PROFILE


def get_student_profile_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get the authenticated student's basic profile.

    Security:
        - student_id is injected by the server.
        - organization_id is injected by the server.
        - Student lookup is organization-scoped.
        - Sensitive/internal fields are never returned.

    This tool is READ-ONLY.
    """

    student = get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    return {
        "student_name": student.full_name,
        "email": student.email,
        "phone": student.phone,

        "program": student.program,
        "department": student.department,
        "academic_year": student.academic_year,
        "semester": student.semester,

        "application_number": student.application_number,
        "admission_number": student.admission_number,
        "roll_number": student.roll_number,

        "status": student.status,
        "admission_status": student.admission_status,
    }



# GET ADMISSION STATUS


def get_admission_status_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get the authenticated student's admission status.

    This tool is READ-ONLY.

    Security:
        - student_id is injected by the server.
        - organization_id is injected by the server.
        - Admission lookup is organization-scoped.
        - Only the authenticated student's admission is returned.
        - Internal reviewer information is not exposed.
    """

    # --------------------------------------------------------
    # GET STUDENT
    # --------------------------------------------------------

    student = get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    # --------------------------------------------------------
    # GET ADMISSION
    # --------------------------------------------------------

    admission = get_admission_by_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    # --------------------------------------------------------
    # RETURN SAFE ADMISSION INFORMATION
    # --------------------------------------------------------

    return {
        "application_number": (
            admission.application_number
        ),

        "program": admission.program,

        "admission_type": (
            admission.admission_type
        ),

        "admission_status": (
            admission.status
        ),

        "eligibility_status": (
            admission.eligibility_status
        ),

        "eligibility_reason": (
            admission.eligibility_reason
        ),

        "application_date": (
            admission.application_date.isoformat()
            if admission.application_date
            else None
        ),

        "applied_at": (
            admission.applied_at.isoformat()
            if admission.applied_at
            else None
        ),

        "decision_at": (
            admission.decision_at.isoformat()
            if admission.decision_at
            else None
        ),

        "remarks": admission.remarks,

        # ----------------------------------------------------
        # Student workflow identifiers
        # ----------------------------------------------------

        "admission_number": (
            student.admission_number
        ),

        "roll_number": (
            student.roll_number
        ),

        "student_admission_status": (
            student.admission_status
        ),
    }