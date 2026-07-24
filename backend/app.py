from fastapi import FastAPI
from database.database import Base, engine
from router.organization import router as organization_router
from router.user import router as user_router
from models.organization import Organization
from router.document import router as document_router
from router.auth import router as auth_router
from models.user import User
from models.document_chunk import DocumentChunk
from models.chat_session import ChatSession
from models.chat_message import ChatMessage

from router.chat import router as chat_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(organization_router)
app.include_router(user_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(auth_router)

@app.get('/') 
def hello() :
    return {"message" : "hello world"}
