"""
CampusFlow-Mesh: Decentralized Multi-Agent Campus Operations Network
Hackathon MVP: uAgents + ASI:One Chat Protocol + policy retrieval + onboarding tasks.

Important:
- policies.json contains DEMO records until replaced with verified official policies.
- Document review is not document authentication.
- Onboarding persistence uses agent storage and is a prototype, not a production database.
"""

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from uagents import Agent, Bureau, Context, Model, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
POLICY_FILE = BASE_DIR / "policies.json"


def required_seed(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value or value.startswith("replace_with_"):
        raise RuntimeError(
            f"Set {name} in your local .env file to a unique private seed."
        )
    return value


ROUTER_SEED = required_seed("CAMPUS_ROUTER_SEED")
ADMISSION_SEED = required_seed("CAMPUS_ADMISSION_SEED")
ONBOARDING_SEED = required_seed("CAMPUS_ONBOARDING_SEED")
KNOWLEDGE_SEED = required_seed("CAMPUS_KNOWLEDGE_SEED")


# -------------------------------------------------------------------
# MESSAGE SCHEMAS
# -------------------------------------------------------------------

class RAGQueryRequest(Model):
    request_id: str
    user_id: str
    question: str


class RAGQueryResponse(Model):
    request_id: str
    user_id: str
    answer: str
    source_citation: str


class OnboardingTaskRequest(Model):
    request_id: str
    student_id: str
    task_name: str


class OnboardingTaskResponse(Model):
    request_id: str
    student_id: str
    task_name: str
    completed: bool
    message: str


class DocumentVerifyRequest(Model):
    applicant_id: str
    document_type: str
    extracted_text: str


class DocumentVerifyResponse(Model):
    applicant_id: str
    document_type: str
    status: str
    reason: str


class AdmissionReviewRequest(Model):
    applicant_id: str
    board_percentage: float
    documents_verified: bool


class AdmissionReviewResponse(Model):
    applicant_id: str
    status: str
    assigned_course: str | None = None


# -------------------------------------------------------------------
# AGENTS
# -------------------------------------------------------------------

admission_agent = Agent(
    name="campus_admission_agent",
    seed=ADMISSION_SEED,
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
)

onboarding_agent = Agent(
    name="campus_onboarding_agent",
    seed=ONBOARDING_SEED,
    port=8002,
    endpoint=["http://127.0.0.1:8002/submit"],
)

knowledge_agent = Agent(
    name="campus_knowledge_agent",
    seed=KNOWLEDGE_SEED,
    port=8003,
    endpoint=["http://127.0.0.1:8003/submit"],
)

router_agent = Agent(
    name="campus_gateway_router",
    seed=ROUTER_SEED,
    port=8000,
    endpoint=["http://127.0.0.1:8000/submit"],
)

# Official ASI:One Chat Protocol on the public-facing gateway.
chat_proto = Protocol(spec=chat_protocol_spec)

# Separate protocol objects on sender and receiver sides. Message schemas
# must match exactly on both ends.
knowledge_request_proto = Protocol(
    name="CampusKnowledgeRequestProtocol", version="1.0.0"
)
knowledge_response_proto = Protocol(
    name="CampusKnowledgeResponseProtocol", version="1.0.0"
)
onboarding_request_proto = Protocol(
    name="CampusOnboardingRequestProtocol", version="1.0.0"
)
onboarding_response_proto = Protocol(
    name="CampusOnboardingResponseProtocol", version="1.0.0"
)
admission_proto = Protocol(name="CampusAdmissionProtocol", version="1.0.0")


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------

def create_chat_reply(text: str, end_session: bool = True) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


def chat_text(msg: ChatMessage) -> str:
    return "\n".join(
        item.text for item in msg.content if isinstance(item, TextContent)
    ).strip()


def load_policies() -> list[dict]:
    if not POLICY_FILE.exists():
        return []
    with POLICY_FILE.open("r", encoding="utf-8") as file:
        records = json.load(file)
    if not isinstance(records, list):
        raise ValueError("policies.json must contain a JSON list.")
    return [record for record in records if isinstance(record, dict)]


def retrieve_policy(question: str) -> tuple[str, str]:
    """Retrieve the most relevant policy, prioritizing explicit topic/title matches."""
    policies = load_policies()
    stop_words = {
        "a", "an", "and", "are", "at", "be", "by", "for", "from",
        "how", "i", "in", "is", "it", "me", "of", "on", "or",
        "the", "to", "what", "when", "where", "which", "with",
        "you", "my", "please", "tell", "do", "does", "can", "required",
    }

    def normalize(text: str) -> set[str]:
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        result = set()
        for token in tokens:
            # Small, dependency-free normalization for common plural forms.
            if token.endswith("ies") and len(token) > 4:
                token = token[:-3] + "y"
            elif token.endswith("s") and not token.endswith("ss") and len(token) > 3:
                token = token[:-1]
            if token not in stop_words:
                result.add(token)
        return result

    query_tokens = normalize(question)
    if not query_tokens:
        return (
            "Please ask a specific campus policy question.",
            "No matching source found",
        )

    # Infer the user's intended domain so incidental words in a policy body
    # cannot make a hostel record outrank an admission record.
    lower = question.lower()
    if any(term in query_tokens for term in {"admission", "applicant", "marksheet", "prospectus"}):
        domain = "admission"
    elif "hostel" in query_tokens or "room" in query_tokens:
        domain = "hostel"
    elif "library" in query_tokens:
        domain = "library"
    else:
        domain = None

    ranked = []
    for policy in policies:
        title = str(policy.get("title", ""))
        body = str(policy.get("text", ""))
        title_tokens = normalize(title)
        body_tokens = normalize(body)

        # A title match is stronger than a word appearing only in the body.
        score = 4 * len(query_tokens & title_tokens) + len(query_tokens & body_tokens)
        title_lower = title.lower()
        if domain and domain in title_lower:
            score += 10
        if score > 0:
            ranked.append((score, policy))

    if not ranked:
        return (
            "I could not find a sufficiently relevant answer in the available "
            "policy records. Please check the official college notice or contact "
            "the responsible office.",
            "No matching source found",
        )

    ranked.sort(key=lambda item: item[0], reverse=True)
    score, policy = ranked[0]
    answer = f"{policy.get('title', 'Policy')}: {policy.get('text', '')}"
    citation = (
        f"{policy.get('source', 'Unknown source')} "
        f"(record {policy.get('id', 'unknown')})"
    )
    return answer, citation


def forget_request(ctx: Context, request_id: str) -> None:
    ctx.storage.remove(f"request:{request_id}")


# -------------------------------------------------------------------
# KNOWLEDGE AGENT
# -------------------------------------------------------------------

@knowledge_request_proto.on_message(model=RAGQueryRequest)
async def handle_policy_query(
    ctx: Context, sender: str, msg: RAGQueryRequest
):
    ctx.logger.info(f"Policy lookup request: {msg.question}")
    try:
        answer, citation = retrieve_policy(msg.question)
    except Exception:
        ctx.logger.exception("Policy retrieval failed")
        answer = "Policy retrieval failed. Please try again."
        citation = "Retrieval error"

    await ctx.send(
        sender,
        RAGQueryResponse(
            request_id=msg.request_id,
            user_id=msg.user_id,
            answer=answer,
            source_citation=citation,
        ),
    )


knowledge_agent.include(knowledge_request_proto)


# -------------------------------------------------------------------
# ONBOARDING AGENT
# -------------------------------------------------------------------

@onboarding_request_proto.on_message(model=OnboardingTaskRequest)
async def handle_onboarding_task(
    ctx: Context, sender: str, msg: OnboardingTaskRequest
):
    task_name = re.sub(r"[^a-zA-Z0-9_-]", "_", msg.task_name.strip())[:100]
    student_id = re.sub(r"[^a-zA-Z0-9_-]", "_", msg.student_id.strip())[:100]
    if not task_name or not student_id:
        completed = False
        message = "Student ID and task name are required."
    else:
        task_key = f"task:{student_id}:{task_name}"
        existing = ctx.storage.get(task_key)
        if existing == "recorded":
            completed = True
            message = "This task was already recorded."
        else:
            ctx.storage.set(task_key, "recorded")
            completed = ctx.storage.get(task_key) == "recorded"
            message = (
                "Task was recorded in agent storage."
                if completed
                else "Could not confirm task storage."
            )

    await ctx.send(
        sender,
        OnboardingTaskResponse(
            request_id=msg.request_id,
            student_id=msg.student_id,
            task_name=msg.task_name,
            completed=completed,
            message=message,
        ),
    )


onboarding_agent.include(onboarding_request_proto)


# -------------------------------------------------------------------
# ADMISSION REVIEW AGENT (human review only; no automated decisions)
# -------------------------------------------------------------------

@admission_proto.on_message(model=DocumentVerifyRequest)
async def handle_document_review(
    ctx: Context, sender: str, msg: DocumentVerifyRequest
):
    if len(msg.extracted_text.strip()) > 10:
        reason = (
            "Text was supplied, but authenticity and consistency have not "
            "been verified. Refer to authorized admissions staff."
        )
    else:
        reason = (
            "Insufficient extracted text. Refer to authorized admissions staff."
        )

    await ctx.send(
        sender,
        DocumentVerifyResponse(
            applicant_id=msg.applicant_id,
            document_type=msg.document_type,
            status="REVIEW_REQUIRED",
            reason=reason,
        ),
    )


@admission_proto.on_message(model=AdmissionReviewRequest)
async def handle_admission_review(
    ctx: Context, sender: str, msg: AdmissionReviewRequest
):
    await ctx.send(
        sender,
        AdmissionReviewResponse(
            applicant_id=msg.applicant_id,
            status="REVIEW_REQUIRED",
            assigned_course=None,
        ),
    )


admission_agent.include(admission_proto)


# -------------------------------------------------------------------
# GATEWAY: ASI:ONE CHAT PROTOCOL
# -------------------------------------------------------------------

@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    text = chat_text(msg)
    request_id = str(uuid4())
    ctx.logger.info(f"Chat request received: {text!r}")

    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.now(timezone.utc),
            acknowledged_msg_id=msg.msg_id,
        ),
    )

    if not text:
        await ctx.send(
            sender,
            create_chat_reply(
                "Please ask a campus policy question or request an onboarding task."
            ),
        )
        return

    lower = text.lower()

    # Route explicit task requests before policy terms, because a task request
    # may also mention "hostel", "library", or "registration".
    is_task_request = any(term in lower for term in (
        "create task", "add task", "onboarding", "checklist",
        "register me", "library registration",
    ))

    is_policy_request = any(term in lower for term in (
        "policy", "deadline", "fee", "prospectus", "requirement",
        "requirements", "what documents", "hostel", "library timing",
        "college rule", "official notice",
    ))

    if is_task_request:
        task_name = (
            "library_registration"
            if "library" in lower
            else "hostel_onboarding_checklist"
            if "hostel" in lower
            else "general_onboarding_checklist"
        )
        ctx.storage.set(f"request:{request_id}", sender)
        try:
            await ctx.send(
                onboarding_agent.address,
                OnboardingTaskRequest(
                    request_id=request_id,
                    student_id="demo-student",
                    task_name=task_name,
                ),
            )
        except Exception:
            ctx.logger.exception("Could not dispatch onboarding request")
            forget_request(ctx, request_id)
            await ctx.send(
                sender,
                create_chat_reply("I could not start that task. Please try again."),
            )

    elif is_policy_request:
        ctx.storage.set(f"request:{request_id}", sender)
        try:
            await ctx.send(
                knowledge_agent.address,
                RAGQueryRequest(
                    request_id=request_id,
                    user_id="chat-user",
                    question=text,
                ),
            )
        except Exception:
            ctx.logger.exception("Could not dispatch policy request")
            forget_request(ctx, request_id)
            await ctx.send(
                sender,
                create_chat_reply("I could not search the policy records. Please try again."),
            )

    elif "admission" in lower or "marksheet" in lower:
        await ctx.send(
            sender,
            create_chat_reply(
                "I can route a document for review, but this prototype does not "
                "authenticate documents or make admission decisions. Please "
                "contact authorized admissions staff for an official determination."
            ),
        )
    else:
        await ctx.send(
            sender,
            create_chat_reply(
                "I can search available campus policy records or record an "
                "onboarding task. Try: 'What are the hostel requirements?' or "
                "'Create my library registration task.'"
            ),
        )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(
    ctx: Context, sender: str, msg: ChatAcknowledgement
):
    ctx.logger.info(f"Chat acknowledgement received from {sender}")


# Gateway receives knowledge results.
@knowledge_response_proto.on_message(model=RAGQueryResponse)
async def handle_policy_result(
    ctx: Context, sender: str, msg: RAGQueryResponse
):
    original_sender = ctx.storage.get(f"request:{msg.request_id}")
    if not original_sender:
        ctx.logger.warning("No originating chat session for policy result.")
        return

    response = (
        f"{msg.answer}\n\nSource: {msg.source_citation}\n\n"
        "Important: verify requirements against the official college document. "
        "Demo policy records are not official until replaced with verified sources."
    )
    await ctx.send(original_sender, create_chat_reply(response))
    forget_request(ctx, msg.request_id)


# Gateway receives onboarding results.
@onboarding_response_proto.on_message(model=OnboardingTaskResponse)
async def handle_task_result(
    ctx: Context, sender: str, msg: OnboardingTaskResponse
):
    original_sender = ctx.storage.get(f"request:{msg.request_id}")
    if not original_sender:
        ctx.logger.warning("No originating chat session for task result.")
        return

    status = "RECORDED" if msg.completed else "NOT CONFIRMED"
    response = (
        f"Student: {msg.student_id}\n"
        f"Task: {msg.task_name}\n"
        f"Status: {status}\n"
        f"Details: {msg.message}"
    )
    await ctx.send(original_sender, create_chat_reply(response))
    forget_request(ctx, msg.request_id)


router_agent.include(chat_proto, publish_manifest=True)
router_agent.include(knowledge_response_proto)
router_agent.include(onboarding_response_proto)


# -------------------------------------------------------------------
# LOCAL BUREAU RUNNER
# -------------------------------------------------------------------

# LOCAL BUREAU RUNNER
# LOCAL BUREAU RUNNER
if __name__ == "__main__":
    bureau = Bureau(
        port=8005,
        endpoint="http://127.0.0.1:8005/submit",
    )

    bureau.add(router_agent)
    bureau.add(admission_agent)
    bureau.add(onboarding_agent)
    bureau.add(knowledge_agent)

    bureau.run()