from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session


from crud.student import get_student_by_id
from crud.ticket import (
    create_ticket,
    get_student_tickets,
    get_ticket_by_id,
    get_ticket_by_number,
    get_tickets,
    update_ticket,
)
from core.id_generator import generate_ticket_number
from models.ticket import Ticket
from schemas.ticket import TicketCreate, TicketUpdate


VALID_STATUSES = {
    "open",
    "in_progress",
    "waiting_for_student",
    "escalated",
    "resolved",
    "closed",
}

VALID_PRIORITIES = {
    "low",
    "medium",
    "high",
    "urgent",
}


def create_ticket_service(
    db: Session,
    student_id: int,
    organization_id: int,
    ticket_data: TicketCreate,
) -> Ticket:

    student = get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    priority = ticket_data.priority.strip().lower()

    if priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Allowed values: {sorted(VALID_PRIORITIES)}",
        )

    ticket_number = generate_ticket_number(
        db=db,
        organization_id=organization_id,
    )

    ticket = Ticket(
        organization_id=organization_id,
        student_id=student_id,
        ticket_number=ticket_number,
        category=ticket_data.category.strip(),
        subject=ticket_data.subject.strip(),
        description=ticket_data.description.strip(),
        department=ticket_data.department.strip().lower(),
        priority=priority,
        status="open",
    )

    create_ticket(
        db=db,
        ticket=ticket,
    )

    db.commit()
    db.refresh(ticket)

    return ticket


def get_student_tickets_service(
    db: Session,
    student_id: int,
    organization_id: int,
) -> list[Ticket]:

    student = get_student_by_id(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    return get_student_tickets(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )


def get_ticket_service(
    db: Session,
    ticket_id: int,
    organization_id: int,
) -> Ticket:

    ticket = get_ticket_by_id(
        db=db,
        ticket_id=ticket_id,
        organization_id=organization_id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    return ticket


def get_ticket_by_number_service(
    db: Session,
    ticket_number: str,
    organization_id: int,
) -> Ticket:

    ticket = get_ticket_by_number(
        db=db,
        ticket_number=ticket_number,
        organization_id=organization_id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    return ticket


def get_all_tickets_service(
    db: Session,
    organization_id: int,
    status: str | None = None,
    department: str | None = None,
    priority: str | None = None,
) -> list[Ticket]:

    if status and status.strip().lower() not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed values: {sorted(VALID_STATUSES)}",
        )

    if priority and priority.strip().lower() not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Allowed values: {sorted(VALID_PRIORITIES)}",
        )

    return get_tickets(
        db=db,
        organization_id=organization_id,
        status=status.strip().lower() if status else None,
        department=department.strip().lower() if department else None,
        priority=priority.strip().lower() if priority else None,
    )


def update_ticket_service(
    db: Session,
    ticket_id: int,
    organization_id: int,
    ticket_data: TicketUpdate,
) -> Ticket:

    ticket = get_ticket_service(
        db=db,
        ticket_id=ticket_id,
        organization_id=organization_id,
    )

    updates = ticket_data.model_dump(
        exclude_unset=True
    )

    if "status" in updates and updates["status"] is not None:

        new_status = updates["status"].strip().lower()

        if new_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed values: {sorted(VALID_STATUSES)}",
            )

        updates["status"] = new_status

        if new_status == "resolved":
            ticket.resolved_at = datetime.utcnow()

        elif ticket.status == "resolved":
            ticket.resolved_at = None

    if "priority" in updates and updates["priority"] is not None:

        new_priority = updates["priority"].strip().lower()

        if new_priority not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority. Allowed values: {sorted(VALID_PRIORITIES)}",
            )

        updates["priority"] = new_priority

    if "department" in updates and updates["department"] is not None:
        updates["department"] = updates["department"].strip().lower()

    update_ticket(
        db=db,
        ticket=ticket,
        updates=updates,
    )

    db.commit()
    db.refresh(ticket)

    return ticket