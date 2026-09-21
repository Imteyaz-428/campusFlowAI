from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AgentAuditLogResponse(BaseModel):
    id: int
    organization_id: int
    student_id: Optional[int] = None
    user_id: Optional[int] = None

    tool_name: str
    action_type: str
    status: str

    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    error_message: Optional[str] = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)