from typing import Any

from pydantic import BaseModel, Field



# AGENT CHAT REQUEST


class AgentChatRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        description=(
            "Message sent by the student "
            "or applicant to CampusFlow AI."
        ),
    )

    session_id: int | None = Field(
        default=None,
        description=(
            "Existing conversation session. "
            "If omitted, a new session is created."
        ),
    )



# AGENT STEP


class AgentStep(BaseModel):

    step: int

    tool: str

    arguments: dict[str, Any]

    result: Any



# AGENT CHAT RESPONSE


class AgentChatResponse(BaseModel):

    type: str

    message: str

    session_id: int

    citations: list[dict[str, Any]] = []

    steps: list[AgentStep] | None = None