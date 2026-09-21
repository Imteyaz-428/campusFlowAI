from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.enums import UserRole
from dependencies.database import get_db
from core.dependencies import get_current_user
from models.user import User
from schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
)
from services.campus.ticket_service import (
    create_ticket_service,
    get_all_tickets_service,
    get_student_tickets_service,
    get_ticket_by_number_service,
    get_ticket_service,
    update_ticket_service,
)


router = APIRouter(
    prefix="/campus/tickets",
    tags=["Campus Tickets"],
)



# HELPER — GET CURRENT STUDENT


def get_current_student(current_user: User):

    if current_user.student_profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not linked to a student profile.",
        )

    return current_user.student_profile



# CREATE TICKET


@router.post(
    "/",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    student = get_current_student(current_user)

    return create_ticket_service(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
        ticket_data=ticket_data,
    )



# MY TICKETS


@router.get(
    "/my",
    response_model=list[TicketResponse],
)
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    student = get_current_student(current_user)

    return get_student_tickets_service(
        db=db,
        student_id=student.id,
        organization_id=current_user.organization_id,
    )



# ADMIN / TEACHER — ALL TICKETS


@router.get(
    "/",
    response_model=list[TicketResponse],
)
def get_all_tickets(
    ticket_status: str | None = Query(
        default=None,
        alias="status",
    ),
    department: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or teacher can view all tickets.",
        )

    return get_all_tickets_service(
        db=db,
        organization_id=current_user.organization_id,
        status=ticket_status,
        department=department,
        priority=priority,
    )



# GET TICKET BY NUMBER

#
# IMPORTANT:
# This route must appear BEFORE /{ticket_id}.
#
# Example:
# /campus/tickets/number/TKT-2026-00001
#

@router.get(
    "/number/{ticket_number}",
    response_model=TicketResponse,
)
def get_ticket_by_number(
    ticket_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    ticket = get_ticket_by_number_service(
        db=db,
        ticket_number=ticket_number,
        organization_id=current_user.organization_id,
    )

    # Students can only access their own tickets.
    if current_user.role == UserRole.STUDENT:

        student = get_current_student(current_user)

        if ticket.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own tickets.",
            )

    elif current_user.role not in {
        UserRole.ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access tickets.",
        )

    return ticket



# GET TICKET BY ID


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    ticket = get_ticket_service(
        db=db,
        ticket_id=ticket_id,
        organization_id=current_user.organization_id,
    )

    # Students can only access their own tickets.
    if current_user.role == UserRole.STUDENT:

        student = get_current_student(current_user)

        if ticket.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own tickets.",
            )

    elif current_user.role not in {
        UserRole.ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access tickets.",
        )

    return ticket



# UPDATE TICKET


@router.put(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role not in {
        UserRole.ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or teacher can update tickets.",
        )

    return update_ticket_service(
        db=db,
        ticket_id=ticket_id,
        organization_id=current_user.organization_id,
        ticket_data=ticket_data,
    )