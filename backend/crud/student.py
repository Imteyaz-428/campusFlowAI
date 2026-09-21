from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.id_generator import generate_application_number
from core.security import hash_password

from models.organization import Organization
from models.student import Student

from crud.admission import create_admission

from schemas.student import (
    StudentCreate,
    StudentUpdate,
)

from schemas.admission import AdmissionCreate



# ORGANIZATION


def _get_organization_by_slug(
    db: Session,
    slug: str,
) -> Organization:
    """
    Resolve a college/organization from its public slug.
    """

    normalized_slug = slug.strip().lower()

    organization = (
        db.query(Organization)
        .filter(
            Organization.slug == normalized_slug
        )
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "College not found for the supplied "
                "organization slug."
            ),
        )

    return organization



# CREATE STUDENT APPLICATION


def create_student(
    db: Session,
    student_data: StudentCreate,
):
    """
    Create a student application AND automatically create
    its corresponding admission record.

    Transaction:

        organization_slug
              ↓
        Organization
              ↓
        Generate Application Number
              ↓
        Hash Applicant Password
              ↓
        Create Student
              ↓
        Create Admission
              ↓
        Commit BOTH together
    """

    # ------------------------------------------------------------
    # 1. RESOLVE ORGANIZATION
    # ------------------------------------------------------------

    organization = _get_organization_by_slug(
        db=db,
        slug=student_data.organization_slug,
    )

    # ------------------------------------------------------------
    # 2. NORMALIZE EMAIL
    # ------------------------------------------------------------

    normalized_email = (
        str(student_data.email)
        .strip()
        .lower()
    )

    # ------------------------------------------------------------
    # 3. CHECK DUPLICATE EMAIL
    # ------------------------------------------------------------

    existing_student = (
        db.query(Student)
        .filter(
            Student.organization_id == organization.id,
            Student.email == normalized_email,
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An application already exists for this "
                "email in this college."
            ),
        )

    # ------------------------------------------------------------
    # 4. GENERATE APPLICATION NUMBER
    # ------------------------------------------------------------

    application_number = generate_application_number(
        db=db,
        organization_id=organization.id,
    )

    # ------------------------------------------------------------
    # 5. HASH APPLICANT PASSWORD
    # ------------------------------------------------------------
    #
    # NEVER store the plain password.
    #
    # StudentCreate.password
    #        ↓
    # get_password_hash()
    #        ↓
    # applicant_password_hash
    #
    # ------------------------------------------------------------

    applicant_password_hash = hash_password(
        student_data.password
    )

    # ------------------------------------------------------------
    # 6. CREATE STUDENT
    # ------------------------------------------------------------

    student = Student(
        organization_id=organization.id,

        # Legacy compatibility field.
        # Use the generated application number.
        student_number=application_number,

        user_id=None,

        # Store only the hashed applicant password.
        applicant_password_hash=applicant_password_hash,

        full_name=student_data.full_name,
        email=normalized_email,
        phone=student_data.phone,
        program=student_data.program,
        department=student_data.department,
        academic_year=student_data.academic_year,
        semester=student_data.semester,
        status="pending",
        application_number=application_number,
        admission_status="submitted",
    )

    db.add(student)

    try:

        # --------------------------------------------------------
        # 7. FLUSH STUDENT
        # --------------------------------------------------------
        #
        # Gives us student.id without committing.
        #

        db.flush()

        # --------------------------------------------------------
        # 8. CREATE ADMISSION AUTOMATICALLY
        # --------------------------------------------------------

        admission_data = AdmissionCreate(
            student_id=student.id,

            application_number=student.application_number,

            program=student.program,

            admission_type="regular",

            status="pending",

            remarks=(
                "Admission record automatically created "
                "from student application."
            ),
        )

        create_admission(
            db=db,
            admission_data=admission_data,

            # Same organization as the student.
            organization_id=organization.id,

            # Student + Admission committed together.
            commit=False,
        )

        # --------------------------------------------------------
        # 9. COMMIT TRANSACTION
        # --------------------------------------------------------

        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Unable to create student application "
                "because a unique value already exists."
            ),
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    # ------------------------------------------------------------
    # 10. REFRESH STUDENT
    # ------------------------------------------------------------

    db.refresh(student)

    return student



# LIST STUDENTS


def get_students(
    db: Session,
    organization_id: int,
):
    """
    Return students belonging only to the current organization.
    """

    return (
        db.query(Student)
        .filter(
            Student.organization_id == organization_id
        )
        .order_by(
            Student.id.desc()
        )
        .all()
    )



# GET STUDENT BY ID


def get_student_by_id(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Organization-scoped student lookup.
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



# LEGACY STUDENT NUMBER LOOKUP


def get_student_by_number(
    db: Session,
    student_number: str,
    organization_id: int,
):
    """
    Legacy student-number lookup.

    Kept temporarily for compatibility.
    """

    student = (
        db.query(Student)
        .filter(
            Student.student_number == student_number.strip(),
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



# GET STUDENT BY USER ACCOUNT


def get_student_by_user_id(
    db: Session,
    user_id: int,
    organization_id: int,
):
    """
    Find the student profile linked to the authenticated account.
    """

    return (
        db.query(Student)
        .filter(
            Student.user_id == user_id,
            Student.organization_id == organization_id,
        )
        .first()
    )



# UPDATE STUDENT


def update_student(
    db: Session,
    student_id: int,
    student_data: StudentUpdate,
    organization_id: int,
):
    """
    Update editable student profile fields.

    Workflow-controlled fields such as:

        application_number
        admission_number
        roll_number
        admission_status

    cannot be changed here.

    Applicant authentication credentials are also excluded.
    """

    student = get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    update_data = student_data.model_dump(
        exclude_unset=True
    )

    allowed_fields = {
        "full_name",
        "email",
        "phone",
        "program",
        "department",
        "academic_year",
        "semester",
    }

    for key, value in update_data.items():

        if key not in allowed_fields:
            continue

        if isinstance(value, str):
            value = value.strip()

        # --------------------------------------------------------
        # EMAIL NORMALIZATION
        # --------------------------------------------------------

        if key == "email" and value:

            value = value.lower()

            existing_student = (
                db.query(Student)
                .filter(
                    Student.organization_id == organization_id,
                    Student.email == value,
                    Student.id != student.id,
                )
                .first()
            )

            if existing_student:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Another student application already "
                        "uses this email in this college."
                    ),
                )

        setattr(
            student,
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
                "Student update violates a "
                "database constraint."
            ),
        )

    db.refresh(student)

    return student



# GET STUDENT BY APPLICATION NUMBER


def get_student_by_application_number(
    db: Session,
    application_number: str,
    organization_id: int,
):
    """
    Find an applicant using:

        organization_id
        application_number

    Application numbers are organization-scoped.
    """

    normalized_application_number = (
        application_number
        .strip()
        .upper()
    )

    student = (
        db.query(Student)
        .filter(
            Student.organization_id == organization_id,
            Student.application_number
            == normalized_application_number,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid application number.",
        )

    return student