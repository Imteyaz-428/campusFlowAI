import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.dependencies import get_current_applicant
from dependencies.database import get_db

from models.student import Student

from schemas.chat import ChatRequest

from services.chat.chat_service import ChatService


router = APIRouter(
    prefix="/campus/applicant/chat",
    tags=["Applicant AI Chat"],
)


chat_service = ChatService()


# ================================================================
# APPLICANT CHAT STREAM
# ================================================================

@router.post("/stream")
def applicant_chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_applicant: Student = Depends(
        get_current_applicant
    ),
):
    """
    Applicant-only AI chat.

    Identity comes from Applicant JWT.

    The frontend cannot provide:
        student_id
        organization_id

    Both are resolved from the authenticated applicant.
    """

    stream = chat_service.applicant_chat_stream(
        db=db,
        question=request.question,
        organization_id=current_applicant.organization_id,
    )

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )