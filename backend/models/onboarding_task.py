from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.database import Base


class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    task_key = Column(
        String(100),
        nullable=False,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    required = Column(
        Boolean,
        nullable=False,
        default=True,
    )


    # AUTOMATION WORKFLOW STATUS

    #
    # pending
    #     Task has been created but automation has not processed it.
    #
    # in_progress
    #     Student information/action is still being processed.
    #
    # waiting_for_student
    #     Student must provide/fix something.
    #
    # processing
    #     Automation is currently processing the task.
    #
    # completed
    #     Task was successfully completed automatically or by
    #     an authorized human exception workflow.
    #
    # needs_human_review
    #     Automation found an exception that requires staff review.
    #
    # failed
    #     Automation failed unexpectedly.
    #


    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )

    due_date = Column(
        DateTime,
        nullable=True,
    )


    # SUBMISSION / PROCESSING


    submitted_at = Column(
        DateTime,
        nullable=True,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )


    # HUMAN REVIEW


    reviewed_at = Column(
        DateTime,
        nullable=True,
    )

    reviewed_by_user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    review_notes = Column(
        Text,
        nullable=True,
    )


    # AUDIT TIMESTAMPS


    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )


    # RELATIONSHIPS


    student = relationship(
        "Student",
        back_populates="onboarding_tasks",
    )

    reviewed_by = relationship(
        "User",
        foreign_keys=[reviewed_by_user_id],
    )