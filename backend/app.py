import models

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine


# MODELS


from models.organization import Organization
from models.user import User
from models.document import Document
from models.document_chunk import DocumentChunk
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from models.student import Student
from models.student_document import StudentDocument
from models.admission import Admission
from models.onboarding_task import OnboardingTask
from models.sequence_counter import SequenceCounter
from models.fee import Fee
from models.ticket import Ticket
from models.agent_audit_log import AgentAuditLog



# ROUTERS


from router.organization import router as organization_router
from router.user import router as user_router
from router.document import router as document_router
from router.auth import router as auth_router
from router.student_documents import router as student_documents_router
from router.campus_onboarding import router as campus_onboarding_router
from router.campus_students import router as campus_students_router
from router.campus_admissions import router as campus_admissions_router
from router.chat import router as chat_router
from router.agent import router as agent_router
from router.campus_fees import router as campus_fees_router
from router.campus_tickets import router as campus_tickets_router
from router.agent_audit import router as agent_audit_router
from router.dashboard import router as dashboard_router
from router.applicant_dashboard import router as applicant_dashboard_router
from router.applicant_chat import router as applicant_chat_router
from router.admin_knowledge import router as admin_knowledge_router


# APPLICATION


app = FastAPI(
    title="CampusFlow AI",
    version="1.0.0",
)



# DATABASE


Base.metadata.create_all(
    bind=engine
)



# CORS


from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://campus-flow-ai-navy.vercel.app",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ROUTER REGISTRATION


app.include_router(
    organization_router
)

app.include_router(
    user_router
)

app.include_router(
    document_router
)

app.include_router(
    auth_router
)

app.include_router(
    chat_router
)

app.include_router(
    campus_students_router
)

app.include_router(
    campus_admissions_router
)

app.include_router(
    campus_onboarding_router
)

app.include_router(
    agent_router
)

app.include_router(
    student_documents_router
)

app.include_router(campus_fees_router)
app.include_router(campus_tickets_router)
app.include_router(agent_audit_router)
app.include_router(
    applicant_dashboard_router
)
app.include_router(dashboard_router)
app.include_router(applicant_chat_router)
app.include_router(
    admin_knowledge_router
)

# HEALTH CHECK


@app.get("/")
def hello():
    return {
        "message": "campusFlow is running"
    }