from decimal import Decimal

from sqlalchemy.orm import Session

from crud.fee import get_fees_by_student



# GET FEE STATUS


def get_fee_status_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return a safe, organization-scoped fee summary
    for the authenticated student.
    """

    fees = get_fees_by_student(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    total_amount = Decimal("0")
    paid_amount = Decimal("0")
    pending_amount = Decimal("0")

    mandatory_pending = []

    fee_results = []

    for fee in fees:

        amount = fee.amount or Decimal("0")

        fee_status = (
            fee.status or "pending"
        ).strip().lower()

        mandatory = (
            fee.is_mandatory or "false"
        ).strip().lower() == "true"

        total_amount += amount

        if fee_status == "paid":

            paid_amount += amount

        elif fee_status == "pending":

            pending_amount += amount

        if mandatory and fee_status != "paid":

            mandatory_pending.append(
                fee.fee_type
            )

        fee_results.append(
            {
                "fee_type": fee.fee_type,

                "amount": str(amount),

                "currency": fee.currency,

                "status": fee_status,

                "mandatory": mandatory,

                "transaction_reference": (
                    fee.transaction_reference
                ),

                "paid_at": (
                    fee.paid_at.isoformat()
                    if fee.paid_at
                    else None
                ),

                "due_date": (
                    fee.due_date.isoformat()
                    if fee.due_date
                    else None
                ),
            }
        )

    # --------------------------------------------------------
    # Overall fee status
    # --------------------------------------------------------

    if not fees:

        overall_status = "no_fees"

    elif pending_amount == Decimal("0"):

        overall_status = "paid"

    else:

        overall_status = "pending"

    return {
        "fees": fee_results,

        "total_amount": str(
            total_amount
        ),

        "paid_amount": str(
            paid_amount
        ),

        "pending_amount": str(
            pending_amount
        ),

        "mandatory_pending": (
            len(mandatory_pending) > 0
        ),

        "mandatory_pending_fees": (
            mandatory_pending
        ),

        "overall_status": (
            overall_status
        ),
    }
