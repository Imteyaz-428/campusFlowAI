from sqlalchemy.orm import Session

from models.agent_audit_log import AgentAuditLog


def create_agent_audit_log(
    db: Session,
    organization_id: int,
    tool_name: str,
    action_type: str,
    status: str,
    student_id: int | None = None,
    user_id: int | None = None,
    input_summary: str | None = None,
    output_summary: str | None = None,
    error_message: str | None = None,
):
    audit_log = AgentAuditLog(
        organization_id=organization_id,
        student_id=student_id,
        user_id=user_id,
        tool_name=tool_name,
        action_type=action_type,
        status=status,
        input_summary=input_summary,
        output_summary=output_summary,
        error_message=error_message,
    )

    db.add(audit_log)
    db.flush()

    return audit_log


def get_agent_audit_logs(
    db: Session,
    organization_id: int,
    student_id: int | None = None,
    tool_name: str | None = None,
    action_type: str | None = None,
    status: str | None = None,
    limit: int = 100,
    offset: int = 0,
):
    query = (
        db.query(AgentAuditLog)
        .filter(
            AgentAuditLog.organization_id == organization_id
        )
    )

    if student_id is not None:
        query = query.filter(
            AgentAuditLog.student_id == student_id
        )

    if tool_name is not None:
        query = query.filter(
            AgentAuditLog.tool_name == tool_name
        )

    if action_type is not None:
        query = query.filter(
            AgentAuditLog.action_type == action_type
        )

    if status is not None:
        query = query.filter(
            AgentAuditLog.status == status
        )

    return (
        query
        .order_by(AgentAuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )