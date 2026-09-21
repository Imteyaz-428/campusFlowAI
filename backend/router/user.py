from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import (
    get_current_user,
    require_role,
    UserRole,
)

from dependencies.database import get_db

from crud.user import (
    create_user,
    create_enrolled_student,
    get_users,
    get_user_by_id,
    update_user,
    delete_user,
    change_password,
)

from schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePassword,
)

from models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)



# CREATE USER


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Create a user account inside the caller's organization.

    ADMIN only.

    Allowed roles:

        ADMIN
            Another administrator for the same college.

        TEACHER
            A faculty account.

        STUDENT
            Direct / walk-in enrollment. This bypasses the public
            application and fee-driven admission workflow: the
            admin is vouching for the student themselves.

            Requires `program` in the request body -- a Student
            record cannot exist without one. `department`,
            `academic_year`, `semester` and `phone` are optional.

            Creates, in one transaction:

                Student   (status=active,
                           admission_status=confirmed,
                           admission_number generated,
                           roll_number generated when
                           department is given)
                Admission (status=confirmed)
                User      (role=student, linked via
                           Student.user_id)

            This produces the same end state a student reaches
            through the normal applicant -> approval -> fee
            payment -> confirm_admission_service() path, so fees,
            onboarding and the agent tools behave identically
            regardless of which path the student came through.

    The new account always inherits the organization of the
    admin who created it. organization_id is never accepted from
    the request body, so an admin cannot inject a user into
    another college.
    """

    # STUDENT: DIRECT ENROLLMENT

    if user.role == UserRole.STUDENT:

        return create_enrolled_student(
            db=db,
            user=user,
            organization_id=current_admin.organization_id,
        )

    # ADMIN / TEACHER

    if user.role not in (UserRole.ADMIN, UserRole.TEACHER):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported role.",
        )

    return create_user(
        db=db,
        user=user,
        organization_id=current_admin.organization_id,
    )



# LIST USERS


@router.get(
    "/",
    response_model=List[UserResponse],
)
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Return all users belonging to the current organization.

    ADMIN only.
    """

    return get_users(
        db=db,
        organization_id=current_admin.organization_id,
    )



# CHANGE PASSWORD


@router.put(
    "/change-password",
    status_code=status.HTTP_200_OK,
)
def update_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the password of the authenticated user.
    """

    return change_password(
        db=db,
        user=current_user,
        current_password=data.current_password,
        new_password=data.new_password,
    )


# GET CURRENT USER


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Return the currently authenticated user's profile.
    """

    return current_user


# UPDATE USER


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def update_existing_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a user account.

    Rules:

        User:
            Can update own profile.

        ADMIN:
            Can update users belonging to the same organization.

    Role and organization cannot be changed through this endpoint.
    """

    # SELF UPDATE

    if current_user.id == user_id:

        return update_user(
            db=db,
            user_id=user_id,
            user_update=user_update,
            organization_id=current_user.organization_id,
        )

    # ADMIN UPDATE

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only update your own profile."
            ),
        )

    # ADMIN CAN ONLY MODIFY USERS FROM SAME ORGANIZATION

    return update_user(
        db=db,
        user_id=user_id,
        user_update=user_update,
        organization_id=current_user.organization_id,
    )



# DELETE USER


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
)
def delete_existing_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    """
    Delete a user account.

    ADMIN only.

    Two protections apply:

        1. An admin cannot delete their own account.

        2. The last remaining ADMIN of an organization cannot be
           deleted, which would otherwise leave the organization
           permanently unmanageable.
    """

    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    # PROTECT THE LAST ADMIN

    target_user = get_user_by_id(
        db=db,
        user_id=user_id,
        organization_id=current_admin.organization_id,
    )

    if target_user.role == UserRole.ADMIN:

        remaining_admins = (
            db.query(User)
            .filter(
                User.organization_id
                == current_admin.organization_id,
                User.role == UserRole.ADMIN,
                User.id != user_id,
            )
            .count()
        )

        if remaining_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "This is the last admin of the organization "
                    "and cannot be deleted."
                ),
            )

    return delete_user(
        db=db,
        user_id=user_id,
        organization_id=current_admin.organization_id,
    )



# GET USER BY ID


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a user belonging to the authenticated user's organization.

    Users can access their own account.

    ADMIN can access other users in the same organization.
    """

    user = get_user_by_id(
        db=db,
        user_id=user_id,
        organization_id=current_user.organization_id,
    )

    # SELF ACCESS

    if user.id == current_user.id:
        return user

    # ADMIN ACCESS

    if current_user.role == UserRole.ADMIN:
        return user

    # OTHER ROLES

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "You are not allowed to access "
            "another user's account."
        ),
    )