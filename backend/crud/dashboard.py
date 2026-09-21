from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models.student import Student
from models.admission import Admission
from models.student_document import StudentDocument
from models.fee import Fee
from models.ticket import Ticket
from models.agent_audit_log import AgentAuditLog


def get_dashboard_overview(
    db: Session,
    organization_id: int,
):
    
    # STUDENTS
    

    students = (
        db.query(Student)
        .filter(
            Student.organization_id == organization_id
        )
        .count()
    )

    
    # APPLICATIONS
    

    applications = (
        db.query(Admission)
        .filter(
            Admission.organization_id == organization_id
        )
        .count()
    )

    
    # PENDING DOCUMENTS
    

    pending_documents = (
        db.query(StudentDocument)
        .join(
            Student,
            Student.id == StudentDocument.student_id,
        )
        .filter(
            Student.organization_id == organization_id,
            StudentDocument.verification_status.in_(
                [
                    "uploaded",
                    "processing",
                    "review_required",
                ]
            ),
        )
        .count()
    )

    
    # PENDING FEES
    

    pending_fees = (
        db.query(Fee)
        .join(
            Student,
            Student.id == Fee.student_id,
        )
        .filter(
            Student.organization_id == organization_id,
            Fee.status == "pending",
        )
        .count()
    )

    
    # OPEN TICKETS
    

    open_tickets = (
        db.query(Ticket)
        .filter(
            Ticket.organization_id == organization_id,
            Ticket.status.in_(
                [
                    "open",
                    "in_progress",
                ]
            ),
        )
        .count()
    )

    
    # ESCALATED TICKETS
    

    escalated_tickets = (
        db.query(Ticket)
        .filter(
            Ticket.organization_id == organization_id,
            Ticket.status == "escalated",
        )
        .count()
    )

    
    # AGENT ACTIONS TODAY
    

    today = datetime.now(timezone.utc).date()

    start_of_day = datetime.combine(
        today,
        datetime.min.time(),
        tzinfo=timezone.utc,
    )

    agent_actions_today = (
        db.query(AgentAuditLog)
        .filter(
            AgentAuditLog.organization_id == organization_id,
            AgentAuditLog.created_at >= start_of_day,
        )
        .count()
    )

    return {
        "students": students,
        "applications": applications,
        "pending_documents": pending_documents,
        "pending_fees": pending_fees,
        "open_tickets": open_tickets,
        "escalated_tickets": escalated_tickets,
        "agent_actions_today": agent_actions_today,
    }