from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.enums import UserRole
from models.student import Student
from models.user import User


def activate_student_account(
    db: Session,
    student: Student,
    commit: bool = True,
):
    """
    Activate a registered Student account after admission confirmation.

    Rules:
    - Only confirmed students can be activated.
    - Applicant password hash is reused.
    - Plaintext password is never stored.
    - A User account is created with STUDENT role.
    - Student.user_id is linked to the new User.
    """


    # ADMISSION MUST BE CONFIRMED


    if student.admission_status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Student account can only be activated "
                "after admission confirmation."
            ),
        )


    # ALREADY ACTIVATED


    if student.user_id is not None:
        existing_user = (
            db.query(User)
            .filter(User.id == student.user_id)
            .first()
        )

        if existing_user is not None:
            return existing_user

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student has an invalid account link.",
        )


    # PASSWORD HASH MUST EXIST


    if not student.applicant_password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Student cannot be activated because "
                "no applicant password is available."
            ),
        )


    # CHECK EXISTING USER


    existing_user = (
        db.query(User)
        .filter(User.email == student.email)
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A user account already exists with "
                "this email address."
            ),
        )


    # CREATE REGISTERED STUDENT USER


    new_user = User(
        name=student.full_name,
        email=student.email,
        password=student.applicant_password_hash,
        role=UserRole.STUDENT,
        organization_id=student.organization_id,
    )

    db.add(new_user)

    # Get new_user.id before commit
    db.flush()


    # LINK STUDENT → USER


    student.user_id = new_user.id

    db.add(student)


    # COMMIT


    if commit:
        db.commit()
        db.refresh(new_user)
        db.refresh(student)

    return new_user