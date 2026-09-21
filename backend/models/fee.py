from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Column,
    DateTime,
    Date,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from database.database import Base


class Fee(Base):

    __tablename__ = "fees"

   
    # TABLE CONSTRAINTS
   

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "admission_id",
            "fee_type",
            name="uq_fees_org_admission_type",
        ),

        Index(
            "idx_fees_organization_id",
            "organization_id",
        ),

        Index(
            "idx_fees_student_id",
            "student_id",
        ),

        Index(
            "idx_fees_admission_id",
            "admission_id",
        ),

        Index(
            "idx_fees_status",
            "organization_id",
            "status",
        ),
    )

   
    # PRIMARY KEY
   

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

   
    # ORGANIZATION
   

    organization_id = Column(
        Integer,
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

   
    # STUDENT
   

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

   
    # ADMISSION
   

    admission_id = Column(
        Integer,
        ForeignKey(
            "admissions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

   
    # APPLICATION REFERENCE
   

    application_number = Column(
        String(50),
        nullable=False,
        index=True,
    )

   
    # FEE INFORMATION
   

    fee_type = Column(
        String(100),
        nullable=False,
        default="admission",
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    currency = Column(
        String(10),
        nullable=False,
        default="INR",
    )

    description = Column(
        Text,
        nullable=True,
    )

    is_mandatory = Column(
        # Boolean can be introduced later if needed.
        # String keeps this model consistent with the current
        # prototype style.
        String(10),
        nullable=False,
        default="true",
    )

   
    # FEE STATUS
   

    status = Column(
        String(50),
        nullable=False,
        default="pending",
    )

    # Possible values:
    #
    # pending
    # paid
    # failed
    # waived
    #
    # The service layer will control valid transitions.

   
    # PAYMENT INFORMATION
   

    transaction_reference = Column(
        String(100),
        nullable=True,
        unique=True,
        index=True,
    )

    paid_at = Column(
        DateTime,
        nullable=True,
    )

   
    # DUE DATE
   

    due_date = Column(
        Date,
        nullable=True,
    )

   
    # REMARKS
   

    remarks = Column(
        Text,
        nullable=True,
    )

   
    # TIMESTAMPS
   

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

   
    # RELATIONSHIPS
   

    organization = relationship(
        "Organization",
    )

    student = relationship(
        "Student",
    )

    admission = relationship(
        "Admission",
    )