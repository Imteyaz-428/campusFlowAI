from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from dependencies.database import get_db
from core.dependencies import get_current_admin

from models.user import User

from schemas.agent_audit import AgentAuditLogResponse

from crud.agent_audit import get_agent_audit_logs


router = APIRouter(
    prefix="/campus/agent",
    tags=["Agent Audit"],
)


@router.get(
    "/audit-logs",
    response_model=list[AgentAuditLogResponse],
)
def read_agent_audit_logs(
    student_id: int | None = Query(
        default=None,
        description="Filter by student ID.",
    ),
    tool_name: str | None = Query(
        default=None,
        description="Filter by agent tool name.",
    ),
    action_type: str | None = Query(
        default=None,
        description="Filter by action type: read or write.",
    ),
    status: str | None = Query(
        default=None,
        description="Filter by execution status.",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    current_admin: User = Depends(
        get_current_admin
    ),
    db: Session = Depends(get_db),
):
    """
    Get agent audit logs for the authenticated
    administrator's organization.

    ADMIN only.

    Organization ID is taken from the authenticated
    admin account and is never accepted from the client.
    """

    return get_agent_audit_logs(
        db=db,
        organization_id=current_admin.organization_id,
        student_id=student_id,
        tool_name=tool_name,
        action_type=action_type,
        status=status,
        limit=limit,
        offset=offset,
    )