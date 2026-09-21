from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.database import Base


class ChatSession(Base):

    __tablename__ = "chat_sessions"


    # PRIMARY KEY


    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    # SESSION TITLE


    title = Column(
        String,
        nullable=False,
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


    # REGISTERED USER

    #
    # Existing Student / Admin / Teacher chat uses this.
    #
    # IMPORTANT:
    # This is now nullable because applicants do not have
    # a registered User account yet.
    #

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )


    # APPLICANT / STUDENT

    #
    # Applicant chat uses this.
    #
    # The value is ALWAYS resolved from the authenticated
    # Student identity by the backend.
    #

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )


    # CREATED AT


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


    # RELATIONSHIPS


    organization = relationship(
        "Organization"
    )

    user = relationship(
        "User"
    )

    student = relationship(
        "Student"
    )

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
    )