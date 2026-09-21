from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)

from database.database import Base


class Ticket(Base):

    __tablename__ = "tickets"


    # TABLE CONSTRAINTS


    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "ticket_number",
            name="uq_tickets_org_ticket_number",
        ),

        Index(
            "idx_tickets_organization_id",
            "organization_id",
        ),

        Index(
            "idx_tickets_student_id",
            "student_id",
        ),

        Index(
            "idx_tickets_status",
            "organization_id",
            "status",
        ),

        Index(
            "idx_tickets_department",
            "organization_id",
            "department",
        ),

        Index(
            "idx_tickets_priority",
            "organization_id",
            "priority",
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


    # ASSIGNED USER


    assigned_to_user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )


    # TICKET IDENTIFICATION


    ticket_number = Column(
        String(50),
        nullable=False,
        index=True,
    )


    # TICKET INFORMATION


    category = Column(
        String(100),
        nullable=False,
    )

    subject = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )


    # WORKFLOW ROUTING


    department = Column(
        String(100),
        nullable=False,
        default="general",
    )

    priority = Column(
        String(50),
        nullable=False,
        default="medium",
    )


    # STATUS


    status = Column(
        String(50),
        nullable=False,
        default="open",
    )

    # Possible values:
    #
    # open
    # in_progress
    # waiting_for_student
    # escalated
    # resolved
    # closed
    #
    # Valid transitions should be controlled by the service layer.


    # RESOLUTION


    resolution = Column(
        Text,
        nullable=True,
    )


    # ESCALATION


    escalation_reason = Column(
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

    resolved_at = Column(
        DateTime,
        nullable=True,
    )


    # RELATIONSHIPS


    organization = relationship(
        "Organization",
    )

    student = relationship(
        "Student",
    )

    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_user_id],
    )