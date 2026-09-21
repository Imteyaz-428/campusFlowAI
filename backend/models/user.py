from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from core.enums import UserRole
from database.database import Base


class User(Base):
    __tablename__ = "users"


    # PRIMARY KEY


    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    # ACCOUNT INFORMATION


    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )


    # ROLE


    role = Column(
        Enum(UserRole),
        nullable=False,
        index=True,
    )


    # ORGANIZATION


    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )


    # TIMESTAMP


    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


    # RELATIONSHIPS


    organization = relationship(
        "Organization",
        back_populates="users",
    )

    documents = relationship(
        "Document",
        back_populates="uploader",
    )


    # STUDENT PROFILE


    student_profile = relationship(
        "Student",
        back_populates="user",
        uselist=False,
    )