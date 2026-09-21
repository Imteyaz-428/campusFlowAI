from sqlalchemy.orm import Session

from crud.student import (
    create_student,
    get_student_by_application_number,
    get_student_by_id,
    get_student_by_number,
    get_student_by_user_id,
    get_students,
    update_student,
)

from schemas.student import (
    StudentCreate,
    StudentUpdate,
)



# CREATE STUDENT APPLICATION


def create_student_service(
    db: Session,
    student_data: StudentCreate,
):
    """
    Create a public student application.

    The student CRUD layer handles the complete initial
    application transaction:

        PUBLIC APPLICATION
                ↓
             Student
                ↓
        Application Number
                ↓
             Admission

    Therefore this service must NOT create the admission again.
    """

    student = create_student(
        db=db,
        student_data=student_data,
    )

    return student



# LIST STUDENTS


def list_students_service(
    db: Session,
    organization_id: int,
):
    """
    List students belonging to an organization.
    """

    return get_students(
        db=db,
        organization_id=organization_id,
    )



# GET STUDENT BY ID


def get_student_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get a student using an organization-scoped lookup.
    """

    return get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# GET STUDENT BY APPLICATION NUMBER


def get_student_by_application_number_service(
    db: Session,
    application_number: str,
    organization_id: int,
):
    """
    Find an applicant using their application number.
    """

    return get_student_by_application_number(
        db=db,
        application_number=application_number,
        organization_id=organization_id,
    )



# GET STUDENT BY LEGACY NUMBER


def get_student_by_number_service(
    db: Session,
    student_number: str,
    organization_id: int,
):
    """
    Legacy student-number lookup.
    """

    return get_student_by_number(
        db=db,
        student_number=student_number,
        organization_id=organization_id,
    )



# GET STUDENT BY USER ACCOUNT


def get_student_by_user_service(
    db: Session,
    user_id: int,
    organization_id: int,
):
    """
    Find the student profile linked to an authenticated account.
    """

    return get_student_by_user_id(
        db=db,
        user_id=user_id,
        organization_id=organization_id,
    )



# UPDATE STUDENT PROFILE


def update_student_service(
    db: Session,
    student_id: int,
    student_data: StudentUpdate,
    organization_id: int,
):
    """
    Update editable student profile information.

    Workflow-controlled fields such as:

        application_number
        admission_number
        roll_number
        admission_status

    are handled by dedicated workflows.
    """

    return update_student(
        db=db,
        student_id=student_id,
        student_data=student_data,
        organization_id=organization_id,
    )