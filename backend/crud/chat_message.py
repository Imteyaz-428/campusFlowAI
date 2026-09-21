from sqlalchemy.orm import Session

from models.chat_message import ChatMessage



# SAVE MESSAGE


def save_message(
    db: Session,
    session_id: int,
    role: str,
    content: str,
    citations=None,
):

    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        citations=citations,
    )

    db.add(message)

    db.commit()

    db.refresh(message)

    return message



# RECENT MESSAGES


def get_recent_messages(
    db: Session,
    session_id: int,
    limit: int = 8,
):

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id
        )
        .order_by(
            ChatMessage.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return list(
        reversed(messages)
    )



# ALL SESSION MESSAGES


def get_session_messages(
    db: Session,
    session_id: int,
):

    return (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id
        )
        .order_by(
            ChatMessage.created_at
        )
        .all()
    )