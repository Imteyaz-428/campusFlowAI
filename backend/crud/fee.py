from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.admission import Admission
from models.fee import Fee
from schemas.fee import (
    FeeCreate,
    FeePaymentRequest,
    FeeUpdate,
)



# INTERNAL HELPERS


def _get_admission(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Get an admission while enforcing organization isolation.
    """

    admission = (
        db.query(Admission)
        .filter(
            Admission.id == admission_id,
            Admission.organization_id == organization_id,
        )
        .first()
    )

    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission not found.",
        )

    return admission


def _get_fee(
    db: Session,
    fee_id: int,
    organization_id: int,
):
    """
    Get a fee while enforcing organization isolation.
    """

    fee = (
        db.query(Fee)
        .filter(
            Fee.id == fee_id,
            Fee.organization_id == organization_id,
        )
        .first()
    )

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found.",
        )

    return fee



# CREATE FEE


def create_fee(
    db: Session,
    fee_data: FeeCreate,
    organization_id: int,
):
    """
    Create a fee for an existing admission.
    """

    admission = _get_admission(
        db=db,
        admission_id=fee_data.admission_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # Prevent fee creation for rejected admissions
    # ------------------------------------------------------------

    if admission.status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a fee for a rejected admission.",
        )

    # ------------------------------------------------------------
    # Make sure the same fee type does not already exist
    # ------------------------------------------------------------

    existing_fee = (
        db.query(Fee)
        .filter(
            Fee.organization_id == organization_id,
            Fee.admission_id == admission.id,
            Fee.fee_type == fee_data.fee_type,
        )
        .first()
    )

    if existing_fee:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A fee of this type already exists for this admission.",
        )

    # ------------------------------------------------------------
    # Create fee
    # ------------------------------------------------------------

    fee = Fee(
        organization_id=organization_id,
        student_id=admission.student_id,
        admission_id=admission.id,
        application_number=admission.application_number,
        fee_type=fee_data.fee_type,
        amount=fee_data.amount,
        currency=fee_data.currency.upper(),
        description=fee_data.description,
        is_mandatory=fee_data.is_mandatory,
        status="pending",
        due_date=fee_data.due_date,
        remarks=fee_data.remarks,
    )

    db.add(fee)
    db.commit()
    db.refresh(fee)

    return fee



# GET FEE BY ID


def get_fee_by_id(
    db: Session,
    fee_id: int,
    organization_id: int,
):
    """
    Get a single fee by ID.
    """

    return _get_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )



# LIST FEES


def get_fees(
    db: Session,
    organization_id: int,
    student_id: int | None = None,
    admission_id: int | None = None,
    fee_status: str | None = None,
):
    """
    List fees belonging to an organization.

    Optional filters:
        student_id
        admission_id
        fee_status
    """

    query = (
        db.query(Fee)
        .filter(
            Fee.organization_id == organization_id,
        )
    )

    if student_id is not None:
        query = query.filter(
            Fee.student_id == student_id,
        )

    if admission_id is not None:
        query = query.filter(
            Fee.admission_id == admission_id,
        )

    if fee_status is not None:
        query = query.filter(
            Fee.status == fee_status,
        )

    return (
        query
        .order_by(Fee.id.desc())
        .all()
    )



# GET FEES BY STUDENT


def get_fees_by_student(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get all fees for a student.
    """

    return (
        db.query(Fee)
        .filter(
            Fee.student_id == student_id,
            Fee.organization_id == organization_id,
        )
        .order_by(Fee.id.desc())
        .all()
    )



# GET FEES BY ADMISSION


def get_fees_by_admission(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Get all fees associated with an admission.
    """

    # First verify the admission belongs to the organization.
    _get_admission(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )

    return (
        db.query(Fee)
        .filter(
            Fee.admission_id == admission_id,
            Fee.organization_id == organization_id,
        )
        .order_by(Fee.id.desc())
        .all()
    )



# UPDATE FEE


def update_fee(
    db: Session,
    fee_id: int,
    fee_data: FeeUpdate,
    organization_id: int,
):
    """
    Update a fee before payment.
    """

    fee = _get_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # Paid fees are immutable
    # ------------------------------------------------------------

    if fee.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paid fees cannot be modified.",
        )

    update_data = fee_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(fee, field, value)

    fee.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(fee)

    return fee



# PAY FEE


def pay_fee(
    db: Session,
    fee_id: int,
    organization_id: int,
    payment_data: FeePaymentRequest | None = None,
):
    """
    Simulate payment for a pending fee.

    This is intentionally a prototype payment workflow.
    A real payment gateway can replace this later.
    """

    fee = _get_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # Already paid
    # ------------------------------------------------------------

    if fee.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This fee has already been paid.",
        )

    # ------------------------------------------------------------
    # Only pending fees can be paid
    # ------------------------------------------------------------

    if fee.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee cannot be paid because its current status is '{fee.status}'.",
        )

    # ------------------------------------------------------------
    # Generate transaction reference
    # ------------------------------------------------------------

    transaction_reference = (
        f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
    )

    fee.status = "paid"
    fee.transaction_reference = transaction_reference
    fee.paid_at = datetime.utcnow()

    if payment_data and payment_data.remarks:
        fee.remarks = payment_data.remarks

    fee.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(fee)

    return fee



# DELETE FEE


def delete_fee(
    db: Session,
    fee_id: int,
    organization_id: int,
):
    """
    Delete a fee only if it has not been paid.
    """

    fee = _get_fee(
        db=db,
        fee_id=fee_id,
        organization_id=organization_id,
    )

    if fee.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paid fees cannot be deleted.",
        )

    db.delete(fee)
    db.commit()

    return True