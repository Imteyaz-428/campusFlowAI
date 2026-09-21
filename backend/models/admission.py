from datetime import date, datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)

from sqlalchemy.orm import relationship

from database.database import Base


class Admission(Base):

    __tablename__ = "admissions"


    # TABLE CONSTRAINTS


    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "application_number",
            name="uq_admissions_org_application_number",
        ),

        Index(
            "idx_admissions_organization_id",
            "organization_id",
        ),

        Index(
            "idx_admissions_eligibility_status",
            "organization_id",
            "eligibility_status",
        ),

        Index(
            "idx_admissions_status",
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


    # APPLICATION


    application_number = Column(
        String(50),
        nullable=False,
        index=True,
    )

    program = Column(
        String(150),
        nullable=False,
    )

    admission_type = Column(
        String(50),
        nullable=False,
        default="regular",
    )


    # APPLICATION STATUS


    status = Column(
        String(50),
        nullable=False,
        default="pending",
    )


    # ELIGIBILITY REVIEW


    eligibility_status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )

    eligibility_reason = Column(
        Text,
        nullable=True,
    )


    # ADMIN REVIEWER


    reviewed_by_user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
    )


    # DATES


    application_date = Column(
        Date,
        nullable=False,
        default=date.today,
    )

    applied_at = Column(
        DateTime,
        nullable=True,
    )

    decision_at = Column(
        DateTime,
        nullable=True,
    )


    # REMARKS


    remarks = Column(
        Text,
        nullable=True,
    )


    # RELATIONSHIPS


    student = relationship(
        "Student",
        back_populates="admissions",
    )

    organization = relationship(
        "Organization",
    )

    reviewed_by = relationship(
        "User",
        foreign_keys=[reviewed_by_user_id],
    )