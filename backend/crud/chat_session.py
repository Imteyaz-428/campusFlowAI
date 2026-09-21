from sqlalchemy.orm import Session

from models.chat_session import ChatSession



# REGISTERED USER SESSION


def create_session(
    db: Session,
    title: str,
    organization_id: int,
    user_id: int,
):

    session = ChatSession(
        title=title,
        organization_id=organization_id,
        user_id=user_id,
        student_id=None,
    )

    db.add(session)

    db.commit()

    db.refresh(session)

    return session



# APPLICANT / STUDENT SESSION


def create_student_session(
    db: Session,
    title: str,
    organization_id: int,
    student_id: int,
):

    session = ChatSession(
        title=title,
        organization_id=organization_id,
        user_id=None,
        student_id=student_id,
    )

    db.add(session)

    db.commit()

    db.refresh(session)

    return session



# REGISTERED USER SESSION LOOKUP


def get_session(
    db: Session,
    session_id: int,
    organization_id: int,
    user_id: int,
):

    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.organization_id == organization_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )



# APPLICANT / STUDENT SESSION LOOKUP


def get_student_session(
    db: Session,
    session_id: int,
    organization_id: int,
    student_id: int,
):

    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.organization_id == organization_id,
            ChatSession.student_id == student_id,
            ChatSession.user_id.is_(None),
        )
        .first()
    )



# REGISTERED USER SESSIONS


def get_user_sessions(
    db: Session,
    organization_id: int,
    user_id: int,
):

    return (
        db.query(ChatSession)
        .filter(
            ChatSession.organization_id == organization_id,
            ChatSession.user_id == user_id,
        )
        .order_by(
            ChatSession.created_at.desc()
        )
        .all()
    )



# APPLICANT / STUDENT SESSIONS


def get_student_sessions(
    db: Session,
    organization_id: int,
    student_id: int,
):

    return (
        db.query(ChatSession)
        .filter(
            ChatSession.organization_id == organization_id,
            ChatSession.student_id == student_id,
            ChatSession.user_id.is_(None),
        )
        .order_by(
            ChatSession.created_at.desc()
        )
        .all()
    )



# DELETE SESSION


def delete_session(
    db: Session,
    session: ChatSession,
):

    db.delete(session)

    db.commit()