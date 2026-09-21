"""
RAG tools for CampusFlow AI Agent.

This module exposes the existing institutional RAG system
as an agent-callable tool.

IMPORTANT:
- Do NOT implement a second RAG pipeline.
- Reuse the existing RetrievalService.
- Reuse the existing PromptService.
- Reuse the existing AIService.
- organization_id is always injected by the backend.
"""

from sqlalchemy.orm import Session

from services.chat.retrieval_service import RetrievalService
from services.chat.prompt_service import PromptService
from services.ai.ai_services import AIService



# SERVICE INSTANCES


retrieval_service = RetrievalService()
prompt_service = PromptService()
ai_service = AIService()



# RAG TOOL


def search_institutional_knowledge(
    db: Session,
    question: str,
    organization_id: int,
    student_id: int | None = None,
):
    """
    Search the organization's institutional knowledge base
    and generate a grounded answer.

    This is a READ-ONLY agent tool.

    organization_id is controlled by the backend and must
    never be supplied by the LLM/user.
    """

  
    # VALIDATE QUESTION
  

    if not question or not question.strip():
        raise ValueError(
            "Knowledge search question cannot be empty."
        )

    question = question.strip()

  
    # RETRIEVE RELEVANT DOCUMENT CHUNKS
  

    results = retrieval_service.retrieve(
        db=db,
        question=question,
        organization_id=organization_id,
    )

  
    # BUILD CITATIONS
  

    citations = []

    seen = set()

    for result in results:

        key = (
            result.document.id,
            result.chunk.chunk_index,
        )

        if key in seen:
            continue

        seen.add(key)

        citations.append(
            {
                "document": result.document.original_filename,
                "chunk_index": result.chunk.chunk_index,
            }
        )

  
    # BUILD GROUNDED PROMPT
  
    #
    # We intentionally reuse PromptService.
    #
    # No second RAG prompt is created here.
    #

    prompt = prompt_service.build_prompt(
        history=[],
        chunks=results,
        question=question,
    )

  
    # GENERATE ANSWER
  

    answer = ai_service.generate_answer(
        prompt=prompt,
    )

  
    # RETURN STRUCTURED RESULT
  

    return {
        "question": question,
        "answer": answer,
        "citations": citations,
        "results_found": len(results),
    }