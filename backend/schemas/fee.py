from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field



# CREATE FEE


class FeeCreate(BaseModel):
    """
    Create a fee for an admission.
    """

    admission_id: int = Field(
        ...,
        gt=0,
    )

    fee_type: str = Field(
        default="admission",
        min_length=1,
        max_length=100,
    )

    amount: Decimal = Field(
        ...,
        gt=0,
    )

    currency: str = Field(
        default="INR",
        min_length=1,
        max_length=10,
    )

    description: Optional[str] = None

    is_mandatory: str = Field(
        default="true",
        max_length=10,
    )

    due_date: Optional[date] = None

    remarks: Optional[str] = None



# UPDATE FEE


class FeeUpdate(BaseModel):
    """
    Update fee information before payment.
    """

    amount: Optional[Decimal] = Field(
        default=None,
        gt=0,
    )

    description: Optional[str] = None

    is_mandatory: Optional[str] = Field(
        default=None,
        max_length=10,
    )

    due_date: Optional[date] = None

    remarks: Optional[str] = None



# PAYMENT


class FeePaymentRequest(BaseModel):
    """
    Request to mark a fee as paid.

    Payment is simulated for the prototype.
    """

    remarks: Optional[str] = None



# FEE RESPONSE


class FeeResponse(BaseModel):
    """
    Complete fee representation.
    """

    id: int
    organization_id: int
    student_id: int
    admission_id: int

    application_number: str

    fee_type: str
    amount: Decimal
    currency: str

    description: Optional[str]
    is_mandatory: str

    status: str

    transaction_reference: Optional[str]
    paid_at: Optional[datetime]

    due_date: Optional[date]

    remarks: Optional[str]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )



# LIMITED FEE STATUS RESPONSE


class FeeStatusResponse(BaseModel):
    """
    Safe response for students/applicants checking fee status.
    """

    id: int
    application_number: str
    fee_type: str
    amount: Decimal
    currency: str
    status: str
    transaction_reference: Optional[str]
    paid_at: Optional[datetime]
    due_date: Optional[date]

    model_config = ConfigDict(
        from_attributes=True
    )