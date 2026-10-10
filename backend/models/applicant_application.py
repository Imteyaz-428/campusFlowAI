from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from database.database import Base


class ApplicantApplication(Base):
    __tablename__ = "applicant_applications"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # APPLICANT / STUDENT
    # ============================================================

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    organization_id = Column(
        Integer,
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ============================================================
    # PERSONAL INFORMATION
    # ============================================================

    date_of_birth = Column(
        Date,
        nullable=True,
    )

    gender = Column(
        String(50),
        nullable=True,
    )

    category = Column(
        String(50),
        nullable=True,
    )

    nationality = Column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # PARENT / GUARDIAN
    # ============================================================

    father_name = Column(
        String(255),
        nullable=True,
    )

    mother_name = Column(
        String(255),
        nullable=True,
    )

    # ============================================================
    # ADDRESS
    # ============================================================

    address_line = Column(
        Text,
        nullable=True,
    )

    city = Column(
        String(100),
        nullable=True,
    )

    district = Column(
        String(100),
        nullable=True,
    )

    state = Column(
        String(100),
        nullable=True,
    )

    pincode = Column(
        String(20),
        nullable=True,
    )

    # ============================================================
    # 10TH EDUCATION
    # ============================================================

    tenth_school_name = Column(
        String(255),
        nullable=True,
    )

    tenth_board = Column(
        String(100),
        nullable=True,
    )

    tenth_passing_year = Column(
        Integer,
        nullable=True,
    )

    tenth_roll_number = Column(
        String(100),
        nullable=True,
    )

    tenth_percentage = Column(
        Numeric(5, 2),
        nullable=True,
    )

    # ============================================================
    # 12TH EDUCATION
    # ============================================================

    twelfth_school_name = Column(
        String(255),
        nullable=True,
    )

    twelfth_board = Column(
        String(100),
        nullable=True,
    )

    twelfth_stream = Column(
        String(100),
        nullable=True,
    )

    twelfth_passing_year = Column(
        Integer,
        nullable=True,
    )

    twelfth_roll_number = Column(
        String(100),
        nullable=True,
    )

    twelfth_percentage = Column(
        Numeric(5, 2),
        nullable=True,
    )

    # ============================================================
    # JEE / ENTRANCE EXAMINATION
    # ============================================================

    jee_attempted = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    jee_year = Column(
        Integer,
        nullable=True,
    )

    jee_percentile = Column(
        Numeric(6, 2),
        nullable=True,
    )

    jee_rank = Column(
        Integer,
        nullable=True,
    )

    # ============================================================
    # APPLICATION STATUS
    # ============================================================

    status = Column(
        String(50),
        nullable=False,
        default="draft",
        index=True,
    )

    completion_percentage = Column(
        Integer,
        nullable=False,
        default=0,
    )

    submitted_at = Column(
        DateTime,
        nullable=True,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    student = relationship(
        "Student",
        
    )

    organization = relationship(
        "Organization",
    )