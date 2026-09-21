from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field



# CREATE TICKET


class TicketCreate(BaseModel):

    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    subject: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    description: str = Field(
        ...,
        min_length=5,
    )

    department: str = Field(
        default="general",
        min_length=2,
        max_length=100,
    )

    priority: str = Field(
        default="medium",
        min_length=3,
        max_length=50,
    )



# UPDATE TICKET


class TicketUpdate(BaseModel):

    status: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    priority: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
    )

    department: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    assigned_to_user_id: int | None = None

    resolution: str | None = None

    escalation_reason: str | None = None



# RESPONSE


class TicketResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    organization_id: int

    student_id: int

    assigned_to_user_id: int | None

    ticket_number: str

    category: str

    subject: str

    description: str

    department: str

    priority: str

    status: str

    resolution: str | None

    escalation_reason: str | None

    created_at: datetime

    updated_at: datetime

    resolved_at: datetime | None