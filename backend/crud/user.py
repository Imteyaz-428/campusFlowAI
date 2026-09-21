from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.enums import UserRole
from core.id_generator import (
    generate_admission_number,
    generate_application_number,
    generate_roll_number,
)
from models.admission import Admission
from models.student import Student
from models.user import User

from schemas.user import (
    UserCreate,
    UserUpdate,
)

from core.security import (
    hash_password,
    verify_password,
)



# CREATE USER


def create_user(
    db: Session,
    user: UserCreate,
    organization_id: int,
):
    """
    Create a user account inside an organization.

    Used primarily for institutional accounts such as:
        - ADMIN
        - TEACHER

    Student accounts will be created through the admission /
    confirmation workflow rather than public registration.

    The router/service layer is responsible for deciding which
    roles the caller is allowed to create.
    """

    normalized_email = (
        str(user.email)
        .strip()
        .lower()
    )


    # CHECK DUPLICATE EMAIL


    existing_user = (
        db.query(User)
        .filter(
            User.email == normalized_email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )


    # CREATE USER


    db_user = User(
        name=user.name.strip(),
        email=normalized_email,
        password=hash_password(user.password),
        role=user.role,
        organization_id=organization_id,
    )

    db.add(db_user)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create user. Email may already exist.",
        )

    db.refresh(db_user)

    return db_user



# GET USERS


def get_users(
    db: Session,
    organization_id: int,
):
    """
    Return users belonging only to the specified organization.
    """

    return (
        db.query(User)
        .filter(
            User.organization_id == organization_id
        )
        .order_by(
            User.id.desc()
        )
        .all()
    )



# GET USER BY ID


def get_user_by_id(
    db: Session,
    user_id: int,
    organization_id: int | None = None,
):
    """
    Get a user by ID.

    If organization_id is supplied, the lookup is organization
    scoped to prevent cross-college access.
    """

    query = (
        db.query(User)
        .filter(
            User.id == user_id
        )
    )

    if organization_id is not None:
        query = query.filter(
            User.organization_id == organization_id
        )

    user = query.first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user



# UPDATE USER


def update_user(
    db: Session,
    user_id: int,
    user_update: UserUpdate,
    organization_id: int | None = None,
):
    """
    Update an existing user account.

    Allowed:
        - name
        - email
        - password

    Protected:
        - role
        - organization_id

    Role and organization changes must use dedicated
    administrative workflows.
    """


    # FIND USER


    query = (
        db.query(User)
        .filter(
            User.id == user_id
        )
    )

    if organization_id is not None:
        query = query.filter(
            User.organization_id == organization_id
        )

    db_user = query.first()

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )


    # GET PROVIDED FIELDS


    update_data = user_update.model_dump(
        exclude_unset=True
    )


    # PROTECTED FIELDS


    protected_fields = {
        "role",
        "organization_id",
    }

    for field in protected_fields:
        update_data.pop(
            field,
            None,
        )


    # NORMALIZE EMAIL


    if "email" in update_data:

        normalized_email = (
            str(update_data["email"])
            .strip()
            .lower()
        )

        existing_user = (
            db.query(User)
            .filter(
                User.email == normalized_email,
                User.id != user_id,
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists.",
            )

        update_data["email"] = normalized_email


    # NORMALIZE NAME


    if "name" in update_data:

        update_data["name"] = (
            update_data["name"]
            .strip()
        )


    # HASH PASSWORD


    if "password" in update_data:

        password = update_data["password"]

        if password:
            update_data["password"] = (
                hash_password(password)
            )


    # APPLY UPDATE


    for key, value in update_data.items():

        if key in protected_fields:
            continue

        setattr(
            db_user,
            key,
            value,
        )


    # SAVE


    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User update violates a database constraint.",
        )

    db.refresh(db_user)

    return db_user



# DELETE USER


def delete_user(
    db: Session,
    user_id: int,
    organization_id: int | None = None,
):
    """
    Delete a user account.

    If organization_id is supplied, deletion is organization
    scoped.
    """

    query = (
        db.query(User)
        .filter(
            User.id == user_id
        )
    )

    if organization_id is not None:
        query = query.filter(
            User.organization_id == organization_id
        )

    user = query.first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    db.delete(user)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "User cannot be deleted because "
                "the account is still referenced by campus data."
            ),
        )

    return {
        "message": "User deleted successfully."
    }



# AUTHENTICATE USER


def authenticate_user(
    db: Session,
    email: str,
    password: str,
    organization_id: int,
):
    """
    Authenticate a registered user using:

        organization_id
        email
        password

    Organization is part of the authentication lookup.

    Returns:
        User object if credentials are valid.
        None otherwise.
    """

    normalized_email = (
        str(email)
        .strip()
        .lower()
    )

    user = (
        db.query(User)
        .filter(
            User.email == normalized_email,
            User.organization_id == organization_id,
        )
        .first()
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password,
    ):
        return None

    return user


# CHANGE PASSWORD


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
):
    """
    Change the authenticated user's password.
    """

    if not verify_password(
        current_password,
        user.password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    user.password = hash_password(
        new_password
    )

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to update password.",
        )

    db.refresh(user)

    return {
        "message": "Password updated successfully."
    }



# ADMIN DIRECT STUDENT ENROLLMENT

#
# This is a SEPARATE path from the normal student lifecycle:
#
#     Public application  -> Student (draft)
#     Admission approved  -> Admission.status = approved
#     Mandatory fees paid -> confirm_admission_service()
#                             (admission_confirmation_service.py)
#
# Here an ADMIN enrolls a walk-in / offline student directly.
# There is no applicant stage and no fee gate: the admin is
# vouching for the student's eligibility themselves.
#
# To keep every other module working the same way regardless of
# which path a student came through, this function produces the
# SAME end state that confirm_admission_service() produces:
#
#     Student   (status=active, admission_status=confirmed,
#                admission_number set, roll_number set when a
#                department is given)
#     Admission (status=confirmed)
#     User      (role=student, linked via Student.user_id)
#
# All three are created in one transaction.


def create_enrolled_student(
    db: Session,
    user: UserCreate,
    organization_id: int,
):
    """
    Create a STUDENT User account together with its Student and
    Admission records, already confirmed.

    Raises 400 if user.program is missing — a Student record
    cannot exist without a program.
    """

    if not user.program:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "program is required to enroll a student."
            ),
        )

    normalized_email = (
        str(user.email)
        .strip()
        .lower()
    )


    # DUPLICATE CHECKS

    #
    # Checked against both tables: a student applicant may already
    # exist with this email even though no User account exists
    # yet, and vice versa.


    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user account already exists with this email.",
        )

    existing_student = (
        db.query(Student)
        .filter(
            Student.organization_id == organization_id,
            Student.email == normalized_email,
        )
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A student record already exists with this "
                "email in this college."
            ),
        )

    try:

        # ----------------------------------------------------------
        # 1. IDENTIFIERS
        # ----------------------------------------------------------

        application_number = generate_application_number(
            db=db,
            organization_id=organization_id,
        )

        admission_number = generate_admission_number(
            db=db,
            organization_id=organization_id,
        )

        roll_number = None

        if user.department:
            roll_number = generate_roll_number(
                db=db,
                organization_id=organization_id,
                department_code=user.department,
            )

        # ----------------------------------------------------------
        # 2. CREATE STUDENT (already confirmed — no applicant stage)
        # ----------------------------------------------------------

        student = Student(
            organization_id=organization_id,
            student_number=application_number,
            applicant_password_hash=None,
            full_name=user.name.strip(),
            email=normalized_email,
            phone=user.phone,
            program=user.program,
            department=user.department,
            academic_year=user.academic_year,
            semester=user.semester,
            status="active",
            application_number=application_number,
            admission_number=admission_number,
            roll_number=roll_number,
            admission_status="confirmed",
        )

        db.add(student)
        db.flush()

        # ----------------------------------------------------------
        # 3. CREATE ADMISSION (already confirmed)
        # ----------------------------------------------------------

        admission = Admission(
            organization_id=organization_id,
            student_id=student.id,
            application_number=application_number,
            program=user.program,
            admission_type="direct",
            status="confirmed",
            remarks="Enrolled directly by admin.",
        )

        db.add(admission)

        # ----------------------------------------------------------
        # 4. CREATE STUDENT USER ACCOUNT
        # ----------------------------------------------------------

        new_user = User(
            name=user.name.strip(),
            email=normalized_email,
            password=hash_password(user.password),
            role=UserRole.STUDENT,
            organization_id=organization_id,
        )

        db.add(new_user)
        db.flush()

        # ----------------------------------------------------------
        # 5. LINK STUDENT -> USER
        # ----------------------------------------------------------

        student.user_id = new_user.id

        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Unable to enroll student. Email or identifier "
                "may already exist."
            ),
        )

    db.refresh(new_user)

    return new_user