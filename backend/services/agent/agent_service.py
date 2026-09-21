from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.student import Student

from schemas.agent import AgentChatRequest

from services.agent.orchestrator import (
    AgentOrchestrator,
)

from crud.chat_session import (
    create_session,
    create_student_session,
    get_session,
    get_student_session,
)

from crud.chat_message import (
    save_message,
)

from models.chat_session import ChatSession


# ================================================================
# CONSTANTS
# ================================================================

MAX_TITLE_LENGTH = 50


# ================================================================
# SESSION TITLE
# ================================================================

def _generate_session_title(
    message: str,
) -> str:

    title = message.strip()

    if not title:
        return "New Chat"

    return title[:MAX_TITLE_LENGTH]


# ================================================================
# EXTRACT CITATIONS FROM AGENT EXECUTION
# ================================================================

def _extract_citations(
    execution_steps,
) -> list[dict]:

    citations = []

    seen = set()

    if not execution_steps:
        return citations

    for step in execution_steps:

        result = step.get(
            "result",
            {},
        )

        if not isinstance(
            result,
            dict,
        ):
            continue

        step_citations = result.get(
            "citations",
            [],
        )

        if not isinstance(
            step_citations,
            list,
        ):
            continue

        for citation in step_citations:

            if not isinstance(
                citation,
                dict,
            ):
                continue

            document = citation.get(
                "document"
            )

            chunk_index = citation.get(
                "chunk_index"
            )

            if (
                document is None
                or chunk_index is None
            ):
                continue

            key = (
                document,
                chunk_index,
            )

            if key in seen:
                continue

            seen.add(key)

            citations.append(
                {
                    "document": document,
                    "chunk_index": chunk_index,
                }
            )

    return citations


# ================================================================
# GET OR CREATE AGENT SESSION
# ================================================================

def _get_or_create_agent_session(
    db: Session,
    student: Student,
    session_id: int | None,
    message: str,
    is_applicant: bool,
) -> ChatSession:


    # EXISTING SESSION


    if session_id is not None:

        if is_applicant:

            session = get_student_session(
                db=db,
                session_id=session_id,
                organization_id=student.organization_id,
                student_id=student.id,
            )

        else:

            if student.user_id is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Registered student account "
                        "is not linked to a user."
                    ),
                )

            session = get_session(
                db=db,
                session_id=session_id,
                organization_id=student.organization_id,
                user_id=student.user_id,
            )

        if session is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Chat session not found or "
                    "you do not have permission "
                    "to access it."
                ),
            )

        return session


    # CREATE NEW SESSION


    title = _generate_session_title(
        message
    )

    if is_applicant:

        return create_student_session(
            db=db,
            title=title,
            organization_id=student.organization_id,
            student_id=student.id,
        )


    # REGISTERED STUDENT


    if student.user_id is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Registered student account "
                "is not linked to a user."
            ),
        )

    return create_session(
        db=db,
        title=title,
        organization_id=student.organization_id,
        user_id=student.user_id,
    )


# ================================================================
# PROCESS AGENT MESSAGE
# ================================================================

def process_agent_message(
    db: Session,
    request: AgentChatRequest,
    student: Student,
):
    """
    Process a CampusFlow AI Agent request and persist
    the conversation.

    Authentication identity is completely server-controlled.

    Applicant:
        Student.user_id is NULL
        Session ownership -> Student ID

    Registered Student:
        Student.user_id is NOT NULL
        Session ownership -> User ID

    The client cannot choose:
        - student_id
        - organization_id
        - user_id
        - another user's session
    """


    # DETERMINE AUTHENTICATION STATE


    is_applicant = (
        student.user_id is None
    )


    # GET / CREATE SESSION


    session = _get_or_create_agent_session(
        db=db,
        student=student,
        session_id=request.session_id,
        message=request.message,
        is_applicant=is_applicant,
    )


    # SAVE USER MESSAGE


    save_message(
        db=db,
        session_id=session.id,
        role="user",
        content=request.message.strip(),
    )


    # CREATE AGENT


    agent = AgentOrchestrator()


    # RUN AGENT


    try:

        result = agent.run(
            db=db,
            student_id=student.id,
            organization_id=student.organization_id,
            user_message=request.message.strip(),
            is_applicant=is_applicant,
        )

    except Exception:

        # The user message is already persisted.
        #
        # We deliberately re-raise so the router can return
        # the appropriate error response.

        raise


    # EXTRACT RESPONSE


    assistant_message = (
        result.get(
            "message",
            "",
        )
        if isinstance(
            result,
            dict,
        )
        else ""
    )

    if not assistant_message:

        assistant_message = (
            "I couldn't generate a response."
        )


    # EXTRACT CITATIONS


    execution_steps = []

    if isinstance(
        result,
        dict,
    ):

        execution_steps = (
            result.get(
                "steps",
                [],
            )
            or []
        )

    citations = _extract_citations(
        execution_steps
    )


    # SAVE ASSISTANT MESSAGE


    save_message(
        db=db,
        session_id=session.id,
        role="assistant",
        content=assistant_message,
        citations=citations,
    )


    # RETURN RESPONSE


    return {
        "type": result.get(
            "type",
            "agent_response",
        ),
        "message": assistant_message,
        "session_id": session.id,
        "citations": citations,
        "steps": execution_steps,
    }