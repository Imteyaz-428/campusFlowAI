from datetime import datetime
from pydantic import BaseModel
from typing import List


class ChatSessionCreate(BaseModel):
    title: str


class ChatSessionResponse(BaseModel):
    id: int
    title: str
    organization_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
class ChatSessionListResponse(BaseModel):

    id: int
    title: str
    created_at: datetime
    class Config:
        from_attributes = True
        
class ChatMessageResponse(BaseModel):
    role: str
    content: str
    citations: list | None = None   # <-- new
    class Config:
        from_attributes = True

class ChatSessionDetailResponse(BaseModel):

    id: int
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse]
    class Config:
        from_attributes = True
        
class MessageResponse(BaseModel):
    message: str