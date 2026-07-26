from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(String, nullable=False)

    content = Column(Text, nullable=False)

    citations = Column(JSON, nullable=True)   # <-- new

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )