from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.database import Base


class AgentAuditLog(Base):
    __tablename__ = "agent_audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    tool_name = Column(String(100), nullable=False, index=True)

    action_type = Column(String(20), nullable=False)

    status = Column(String(20), nullable=False)

    input_summary = Column(Text, nullable=True)

    output_summary = Column(Text, nullable=True)

    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    organization = relationship("Organization")
    student = relationship("Student")
    user = relationship("User")