import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from crud.fee import (
    create_fee,
    delete_fee,
    get_fee_by_id,
    get_fees,
    get_fees_by_admission,
    get_fees_by_student,
    pay_fee,
    update_fee,
)

from schemas.fee import (
    FeeCreate,
    FeePaymentRequest,
    FeeUpdate,
)


logger = logging.getLogger(__name__)



# CREATE FEE


def create_fee_service(
    db: Session,
    fee_data: FeeCreate,
    organization_id: int,
):
    """
    Create a fee for an admission.
    """

    return create_fee(
        db=db,
        fee_data=fee_data,
        organization_id=organization_id,
    )



# GET FEE


def get_fee_service(
    db: Session,
    fee_id: int,
    organization_id: int,
):
    """
    Get a single fee.
    """

    return get_fee_by_id(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )



# LIST FEES


def list_fees_service(
    db: Session,
    organization_id: int,
    student_id: int | None = None,
    admission_id: int | None = None,
    fee_status: str | None = None,
):
    """
    List organization fees with optional filters.
    """

    return get_fees(
        db=db,
        organization_id=organization_id,
        student_id=student_id,
        admission_id=admission_id,
        fee_status=fee_status,
    )



# GET STUDENT FEES


def get_student_fees_service(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get all fees for a student.
    """

    return get_fees_by_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )



# GET ADMISSION FEES


def get_admission_fees_service(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Get all fees for an admission.
    """

    return get_fees_by_admission(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )



# UPDATE FEE


def update_fee_service(
    db: Session,
    fee_id: int,
    fee_data: FeeUpdate,
    organization_id: int,
):
    """
    Update a fee before payment.
    """

    return update_fee(
        db=db,
        fee_id=fee_id,
        fee_data=fee_data,
        organization_id=organization_id,
    )



# PAY FEE


def pay_fee_service(
    db: Session,
    fee_id: int,
    organization_id: int,
    payment_data: FeePaymentRequest | None = None,
):
    """
    Process a simulated fee payment and, when this payment
    completes the mandatory fees of an approved admission,
    confirm that admission automatically.

    Flow:

        Applicant applies      ->  Student row created
                                   (status = pending,
                                    admission_status = draft,
                                    applicant_password_hash set)
                v
        Admission approved     ->  admission.status = approved
                v
        Mandatory fees paid    ->  THIS FUNCTION
                v
        Auto confirmation      ->  confirm_admission_service()
                v
                                   admission.status = confirmed
                                   student.status   = active
                                   admission_number generated
                                   STUDENT User account created
                                   student.user_id  linked

    The payment is committed first and is never rolled back by
    the confirmation step. If the admission is not approved yet,
    or other mandatory fees are still pending, the payment still
    stands and confirmation simply does not happen. Staff can
    always trigger it manually later through:

        POST /campus/admissions/{admission_id}/confirm
    """

   
    # 1. PROCESS THE PAYMENT (commits)
   

    fee = pay_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
        payment_data=payment_data,
    )

   
    # 2. ATTEMPT AUTOMATIC ADMISSION CONFIRMATION
   

    _try_confirm_admission_after_payment(
        db=db,
        fee=fee,
        organization_id=organization_id,
    )

    return fee



# AUTOMATIC ADMISSION CONFIRMATION


def _try_confirm_admission_after_payment(
    db: Session,
    fee,
    organization_id: int,
):
    """
    Best-effort admission confirmation triggered by a payment.

    confirm_admission_service() enforces:

        - admission.status == "approved"
        - at least one mandatory fee exists
        - every mandatory fee has status "paid"

    An HTTPException from it means the admission is simply not
    ready yet. That is an expected outcome rather than an error,
    so it is swallowed and the paid fee is returned unchanged.
    """

   
    # Fee must belong to an admission
   

    admission_id = getattr(fee, "admission_id", None)

    if not admission_id:
        return

   
    # Only mandatory fees can complete an admission
    #
    # Fee.is_mandatory is stored as a string in this schema,
    # so the value is normalised defensively.
   

    is_mandatory = str(
        getattr(fee, "is_mandatory", "")
    ).strip().lower()

    if is_mandatory not in ("true", "1", "yes"):
        return

   
    # Imported locally to avoid a circular import between the
    # fee service and the admission confirmation service.
   

    from services.campus.admission_confirmation_service import (
        confirm_admission_service,
    )

    try:
        confirm_admission_service(
            db=db,
            admission_id=admission_id,
            organization_id=organization_id,
        )

    except HTTPException as exc:
        # Not ready to confirm: not approved yet, other mandatory
        # fees outstanding, or already confirmed.
        db.rollback()

        logger.info(
            "Admission %s not auto-confirmed after fee %s: %s",
            admission_id,
            getattr(fee, "id", None),
            exc.detail,
        )

    except Exception:
        # An unexpected failure must not invalidate a paid fee.
        db.rollback()

        logger.exception(
            "Auto-confirmation failed for admission %s "
            "after fee %s was paid.",
            admission_id,
            getattr(fee, "id", None),
        )



# DELETE FEE


def delete_fee_service(
    db: Session,
    fee_id: int,
    organization_id: int,
):
    """
    Delete an unpaid fee.
    """

    return delete_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )