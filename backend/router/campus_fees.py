from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.enums import UserRole
from dependencies.database import get_db

from models.user import User

from schemas.fee import (
    FeeCreate,
    FeePaymentRequest,
    FeeResponse,
    FeeStatusResponse,
    FeeUpdate,
)

from services.campus.fee_service import (
    create_fee_service,
    delete_fee_service,
    get_admission_fees_service,
    get_fee_service,
    get_student_fees_service,
    list_fees_service,
    pay_fee_service,
    update_fee_service,
)

from services.campus.student_service import (
    get_student_by_user_service,
)



# ROUTER


router = APIRouter(
    prefix="/campus/fees",
    tags=["Campus - Fees"],
)



# AUTHORIZATION HELPERS


def _require_staff(
    current_user: User,
) -> User:
    """
    Require ADMIN or TEACHER access.
    """

    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.TEACHER,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin and teacher can manage fees.",
        )

    return current_user


def _require_student_or_staff(
    current_user: User,
) -> User:
    """
    Allow STUDENT, ADMIN, or TEACHER access.
    """

    if current_user.role not in (
        UserRole.STUDENT,
        UserRole.ADMIN,
        UserRole.TEACHER,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )

    return current_user



# CREATE FEE


@router.post(
    "/",
    response_model=FeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_fee(
    fee_data: FeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a fee for an admission.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return create_fee_service(
        db=db,
        fee_data=fee_data,
        organization_id=current_user.organization_id,
    )



# LIST ALL FEES


@router.get(
    "/",
    response_model=list[FeeResponse],
)
def get_fees(
    student_id: int | None = None,
    admission_id: int | None = None,
    fee_status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List fees for the current organization.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return list_fees_service(
        db=db,
        organization_id=current_user.organization_id,
        student_id=student_id,
        admission_id=admission_id,
        fee_status=fee_status,
    )



# STUDENT — MY FEES


@router.get(
    "/me",
    response_model=list[FeeStatusResponse],
)
def get_my_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return fees belonging to the authenticated student.

    Students can only see their own fees.
    """

    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    student = get_student_by_user_service(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student profile is linked to this account.",
        )

    return get_student_fees_service(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# STAFF — GET STUDENT FEES


@router.get(
    "/student/{student_id}",
    response_model=list[FeeResponse],
)
def get_student_fees(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all fees for a student.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return get_student_fees_service(
        db=db,
        student_id=student_id,
        organization_id=current_user.organization_id,
    )



# STAFF — GET ADMISSION FEES


@router.get(
    "/admission/{admission_id}",
    response_model=list[FeeResponse],
)
def get_admission_fees(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all fees associated with an admission.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return get_admission_fees_service(
        db=db,
        admission_id=admission_id,
        organization_id=current_user.organization_id,
    )



# GET FEE BY ID


@router.get(
    "/{fee_id}",
    response_model=FeeResponse,
)
def get_fee(
    fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single fee.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return get_fee_service(
        db=db,
        fee_id=fee_id,
        organization_id=current_user.organization_id,
    )



# UPDATE FEE


@router.put(
    "/{fee_id}",
    response_model=FeeResponse,
)
def update_fee(
    fee_id: int,
    fee_data: FeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an unpaid fee.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    return update_fee_service(
        db=db,
        fee_id=fee_id,
        fee_data=fee_data,
        organization_id=current_user.organization_id,
    )



# PAY FEE


@router.post(
    "/{fee_id}/pay",
    response_model=FeeResponse,
)
def pay_fee(
    fee_id: int,
    payment_data: FeePaymentRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a fee as paid.

    STUDENT:
        Can pay only their own fee.

    ADMIN / TEACHER:
        Can process payment for their organization.

    This is a simulated payment workflow for the prototype.
    """

    _require_student_or_staff(current_user)

    # ------------------------------------------------------------
    # STUDENT OWNERSHIP CHECK
    # ------------------------------------------------------------

    if current_user.role == UserRole.STUDENT:

        student = get_student_by_user_service(
            db=db,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
        )

        if student is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No student profile is linked "
                    "to this account."
                ),
            )

        fee = get_fee_service(
            db=db,
            fee_id=fee_id,
            organization_id=current_user.organization_id,
        )

        if fee.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only pay your own fee.",
            )

    # ------------------------------------------------------------
    # PROCESS PAYMENT
    # ------------------------------------------------------------

    return pay_fee_service(
        db=db,
        fee_id=fee_id,
        organization_id=current_user.organization_id,
        payment_data=payment_data,
    )



# DELETE FEE


@router.delete(
    "/{fee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_fee(
    fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an unpaid fee.

    Allowed:
        ADMIN
        TEACHER
    """

    _require_staff(current_user)

    delete_fee_service(
        db=db,
        fee_id=fee_id,
        organization_id=current_user.organization_id,
    )

    return None