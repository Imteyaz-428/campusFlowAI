from sqlalchemy.orm import Session

from models.ticket import Ticket



# CREATE


def create_ticket(
    db: Session,
    ticket: Ticket,
) -> Ticket:

    db.add(ticket)
    db.flush()

    return ticket



# GET BY ID


def get_ticket_by_id(
    db: Session,
    ticket_id: int,
    organization_id: int,
) -> Ticket | None:

    return (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id,
            Ticket.organization_id == organization_id,
        )
        .first()
    )



# GET BY TICKET NUMBER


def get_ticket_by_number(
    db: Session,
    ticket_number: str,
    organization_id: int,
) -> Ticket | None:

    return (
        db.query(Ticket)
        .filter(
            Ticket.ticket_number == ticket_number,
            Ticket.organization_id == organization_id,
        )
        .first()
    )



# GET STUDENT TICKETS


def get_student_tickets(
    db: Session,
    student_id: int,
    organization_id: int,
) -> list[Ticket]:

    return (
        db.query(Ticket)
        .filter(
            Ticket.student_id == student_id,
            Ticket.organization_id == organization_id,
        )
        .order_by(
            Ticket.created_at.desc()
        )
        .all()
    )



# GET ALL TICKETS


def get_tickets(
    db: Session,
    organization_id: int,
    status: str | None = None,
    department: str | None = None,
    priority: str | None = None,
) -> list[Ticket]:

    query = (
        db.query(Ticket)
        .filter(
            Ticket.organization_id == organization_id
        )
    )

    if status:
        query = query.filter(
            Ticket.status == status
        )

    if department:
        query = query.filter(
            Ticket.department == department
        )

    if priority:
        query = query.filter(
            Ticket.priority == priority
        )

    return (
        query
        .order_by(
            Ticket.created_at.desc()
        )
        .all()
    )



# UPDATE


def update_ticket(
    db: Session,
    ticket: Ticket,
    updates: dict,
) -> Ticket:

    for field, value in updates.items():

        if value is not None:
            setattr(
                ticket,
                field,
                value,
            )

    db.flush()

    return ticket