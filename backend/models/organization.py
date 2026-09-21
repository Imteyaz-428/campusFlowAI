from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from database.database import Base


class Organization(Base):
    __tablename__ = "organizations"

  
    # PRIMARY KEY
  

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

  
    # ORGANIZATION INFORMATION
  

    name = Column(
        String(100),
        nullable=False,
    )

    slug = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

  
    # RELATIONSHIPS
  

    users = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    documents = relationship(
        "Document",
        back_populates="organization",
    )

    students = relationship(
        "Student",
        back_populates="organization",
        cascade="all, delete-orphan",
    )