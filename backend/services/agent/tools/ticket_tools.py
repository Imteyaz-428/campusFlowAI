from sqlalchemy.orm import Session

from services.campus.ticket_service import (
    create_ticket_service,
    get_student_tickets_service,
    get_ticket_by_number_service,
)
from schemas.ticket import TicketCreate




# CREATE TICKET


def create_ticket_tool(
    db: Session,
    student_id: int,
    organization_id: int,
    category: str,
    subject: str,
    description: str,
    department: str,
    priority: str = "medium",
):
    """
    Create a support/complaint ticket for the authenticated student.

    student_id and organization_id are injected by the server.
    The LLM must never control these values.
    """

    ticket_data = TicketCreate(
        category=category,
        subject=subject,
        description=description,
        department=department,
        priority=priority,
    )

    # Reuse the existing service layer.
    ticket = create_ticket_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
        ticket_data=ticket_data,
    )

    return {
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "category": ticket.category,
        "subject": ticket.subject,
        "department": ticket.department,
        "priority": ticket.priority,
        "status": ticket.status,
        "created_at": (
            ticket.created_at.isoformat()
            if ticket.created_at
            else None
        ),
        "message": (
            f"Ticket {ticket.ticket_number} has been created "
            f"and assigned to the {ticket.department} department."
        ),
    }



# GET MY TICKETS


def get_my_tickets_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get tickets belonging only to the authenticated student.
    """

    tickets = get_student_tickets_service(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    return {
        "tickets": [
            {
                "ticket_id": ticket.id,
                "ticket_number": ticket.ticket_number,
                "category": ticket.category,
                "subject": ticket.subject,
                "department": ticket.department,
                "priority": ticket.priority,
                "status": ticket.status,
                "resolution": ticket.resolution,
                "escalation_reason": ticket.escalation_reason,
                "created_at": (
                    ticket.created_at.isoformat()
                    if ticket.created_at
                    else None
                ),
                "updated_at": (
                    ticket.updated_at.isoformat()
                    if ticket.updated_at
                    else None
                ),
                "resolved_at": (
                    ticket.resolved_at.isoformat()
                    if ticket.resolved_at
                    else None
                ),
            }
            for ticket in tickets
        ],
        "total_tickets": len(tickets),
    }



# GET TICKET STATUS


def get_ticket_status_tool(
    db: Session,
    student_id: int,
    organization_id: int,
    ticket_number: str,
):
    """
    Get the status of one ticket.

    The ticket is looked up within the student's organization
    and then ownership is verified against student_id.
    """

    ticket = get_ticket_by_number_service(
        db=db,
        ticket_number=ticket_number,
        organization_id=organization_id,
    )

    if ticket is None:
        return {
            "found": False,
            "ticket_number": ticket_number,
            "message": "No ticket was found with this ticket number.",
        }

    # ------------------------------------------------------------
    # SECURITY:
    # A student can only see their own ticket.
    # ------------------------------------------------------------

    if ticket.student_id != student_id:
        return {
            "found": False,
            "ticket_number": ticket_number,
            "message": (
                "The requested ticket does not belong "
                "to the authenticated student."
            ),
        }

    return {
        "found": True,
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "category": ticket.category,
        "subject": ticket.subject,
        "description": ticket.description,
        "department": ticket.department,
        "priority": ticket.priority,
        "status": ticket.status,
        "resolution": ticket.resolution,
        "escalation_reason": ticket.escalation_reason,
        "created_at": (
            ticket.created_at.isoformat()
            if ticket.created_at
            else None
        ),
        "updated_at": (
            ticket.updated_at.isoformat()
            if ticket.updated_at
            else None
        ),
        "resolved_at": (
            ticket.resolved_at.isoformat()
            if ticket.resolved_at
            else None
        ),
    }