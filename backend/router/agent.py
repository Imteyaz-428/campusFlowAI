from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from core.dependencies import (
    get_current_student_identity,
)

from dependencies.database import get_db

from models.student import Student

from schemas.agent import (
    AgentChatRequest,
    AgentChatResponse,
)

from schemas.chat_session import (
    ChatSessionListResponse,
    ChatSessionDetailResponse,
    MessageResponse,
)

from services.agent.agent_service import (
    process_agent_message,
)

from crud.chat_session import (
    get_user_sessions,
    get_student_sessions,
    get_session,
    get_student_session,
    delete_session,
)

from crud.chat_message import (
    get_session_messages,
)



# ROUTER


router = APIRouter(
    prefix="/agent",
    tags=["Campus AI Agent"],
)



# AGENT CHAT


import logging

logger = logging.getLogger(__name__)


@router.post(
    "/chat",
    response_model=AgentChatResponse,
)
def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(
        get_current_student_identity,
    ),
):
    """
    CampusFlow AI Agent.

    Supports applicants and registered students.
    Identity is resolved server-side.
    """

    try:
        return process_agent_message(
            db=db,
            request=request,
            student=student,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        logger.warning(
            "Agent request validation failed: %s",
            exc,
            exc_info=True,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        logger.exception(
            "Agent runtime error",
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    except Exception:
        logger.exception(
            "Unexpected error in /agent/chat",
        )
        raise

# GET AGENT SESSIONS


@router.get(
    "/sessions",
    response_model=list[ChatSessionListResponse],
)
def get_agent_sessions(
    db: Session = Depends(get_db),
    student: Student = Depends(
        get_current_student_identity,
    ),
):


    # APPLICANT


    if student.user_id is None:

        return get_student_sessions(
            db=db,
            organization_id=student.organization_id,
            student_id=student.id,
        )


    # REGISTERED STUDENT


    return get_user_sessions(
        db=db,
        organization_id=student.organization_id,
        user_id=student.user_id,
    )



# GET ONE AGENT SESSION


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionDetailResponse,
)
def get_agent_session(
    session_id: int,
    db: Session = Depends(get_db),
    student: Student = Depends(
        get_current_student_identity,
    ),
):


    # APPLICANT


    if student.user_id is None:

        session = get_student_session(
            db=db,
            session_id=session_id,
            organization_id=student.organization_id,
            student_id=student.id,
        )


    # REGISTERED STUDENT


    else:

        session = get_session(
            db=db,
            session_id=session_id,
            organization_id=student.organization_id,
            user_id=student.user_id,
        )


    # NOT FOUND


    if session is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Chat session not found or "
                "you do not have permission "
                "to access it."
            ),
        )

    messages = get_session_messages(
        db=db,
        session_id=session.id,
    )

    return {
        "id": session.id,
        "title": session.title,
        "created_at": session.created_at,
        "messages": messages,
    }



# DELETE AGENT SESSION


@router.delete(
    "/sessions/{session_id}",
    response_model=MessageResponse,
)
def delete_agent_session(
    session_id: int,
    db: Session = Depends(get_db),
    student: Student = Depends(
        get_current_student_identity,
    ),
):


    # APPLICANT


    if student.user_id is None:

        session = get_student_session(
            db=db,
            session_id=session_id,
            organization_id=student.organization_id,
            student_id=student.id,
        )


    # REGISTERED STUDENT


    else:

        session = get_session(
            db=db,
            session_id=session_id,
            organization_id=student.organization_id,
            user_id=student.user_id,
        )


    # NOT FOUND


    if session is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Chat session not found or "
                "you do not have permission "
                "to access it."
            ),
        )


    # DELETE


    delete_session(
        db=db,
        session=session,
    )

    return {
        "message": "Chat deleted successfully."
    }