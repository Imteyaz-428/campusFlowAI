from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from database.database import Base


class StudentDocument(Base):
    """
    Document submitted by a student/applicant for verification.

    This model is intentionally separate from the existing RAG
    Document model.

    RAG Document:
        Institutional knowledge
        Policies
        Guidelines
        Admission rules

    StudentDocument:
        Student-submitted documents
        Aadhaar
        Marksheet
        Certificates
        ID proof
        etc.
    """

    __tablename__ = "student_documents"

   
    # PRIMARY KEY
   

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

   
    # STUDENT
   

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

   
    # ORGANIZATION
   
    #
    # Keep organization_id directly on the document.
    #
    # This makes multi-tenant queries and authorization explicit
    # instead of relying only on student -> organization.
    #
   

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )

   
    # DOCUMENT INFORMATION
   

    document_type = Column(
        String(100),
        nullable=False,
        index=True,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=True,
    )

    file_size = Column(
        Integer,
        nullable=True,
    )

   
    # FILE LOCATION
   
    #
    # We do NOT store the actual file binary inside PostgreSQL.
    #
    # The database stores the location/reference.
    #
    # Example:
    #
    # uploads/student_documents/9/7/abc123.pdf
    #
   

    file_path = Column(
        String(500),
        nullable=False,
    )

   
    # FILE INTEGRITY
   
    #
    # SHA-256 hash can later be used to detect duplicate files
    # and verify that a file has not changed.
    #
   

    file_hash = Column(
        String(64),
        nullable=True,
        index=True,
    )

   
    # VERIFICATION STATUS
   
    #
    # Initial:
    #
    #     uploaded
    #
    # Processing:
    #
    #     processing
    #
    # Successful verification:
    #
    #     verified
    #
    # Failed verification:
    #
    #     rejected
    #
    # Requires human/admin review:
    #
    #     review_required
    #
   

    verification_status = Column(
        String(50),
        nullable=False,
        default="uploaded",
        index=True,
    )

   
    # OCR / EXTRACTED DATA
   
    #
    # Stores structured information extracted from the document.
    #
    # Example:
    #
    # {
    #     "name": "Rahul Sharma",
    #     "date_of_birth": "2007-05-12",
    #     "document_number": "XXXX-XXXX-1234"
    # }
    #
    # Sensitive information should be minimized/masked where
    # appropriate.
    #
   

    extracted_data = Column(
        JSON,
        nullable=True,
    )

   
    # OCR TEXT
   
    #
    # Raw/normalized text extracted from the document.
    #
    # This can be used by the verification service.
    #
   

    extracted_text = Column(
        String,
        nullable=True,
    )

   
    # VERIFICATION RESULT
   
    #
    # Human-readable explanation of the verification result.
    #
    # Examples:
    #
    # "Name and date of birth matched."
    # "Name mismatch with student application."
    # "Unable to extract required fields."
    #
   

    verification_reason = Column(
        String(1000),
        nullable=True,
    )

   
    # REVIEWER
   
    #
    # NULL means no staff member has manually reviewed it yet.
    #
    # Used when:
    #
    #     verification_status = review_required
    #
   

    verified_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

   
    # TIMESTAMPS
   

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    processed_at = Column(
        DateTime,
        nullable=True,
    )

    verified_at = Column(
        DateTime,
        nullable=True,
    )

   
    # RELATIONSHIPS
   

    student = relationship(
        "Student",
        back_populates="documents",
    )

    organization = relationship(
        "Organization",
    )

    verified_by = relationship(
        "User",
        foreign_keys=[verified_by_user_id],
    )