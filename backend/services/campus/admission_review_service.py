import json
import re
from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.admission import Admission
from models.student import Student
from models.student_document import StudentDocument

from services.ai.ai_services import AIService

from services.agent.tools.document_tools import (
    REQUIRED_DOCUMENTS,
)

from services.agent.tools.rag_tools import (
    search_institutional_knowledge,
)



# CONSTANTS


MAX_DOCUMENT_TEXT_LENGTH = 6000



# AI SERVICE


_ai_service = AIService()



# GET ADMISSION CONTEXT


def _get_admission_context(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Load the admission and student while enforcing
    organization isolation.
    """

    admission = db.scalar(
        select(Admission)
        .where(
            Admission.id == admission_id,
            Admission.organization_id == organization_id,
        )
    )

    if admission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission not found.",
        )

    student = db.scalar(
        select(Student)
        .where(
            Student.id == admission.student_id,
            Student.organization_id == organization_id,
        )
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    return admission, student



# GET STUDENT DOCUMENTS


def _get_student_documents(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Get all documents belonging to the student.

    If a document was re-uploaded, only the latest upload
    for each document type is used for AI review.
    """

    documents = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.student_id == student_id,
            StudentDocument.organization_id == organization_id,
        )
        .order_by(
            StudentDocument.uploaded_at.desc(),
            StudentDocument.id.desc(),
        )
        .all()
    )

    latest_by_type = {}

    for document in documents:

        document_type = (
            str(document.document_type or "")
            .strip()
            .lower()
        )

        if not document_type:
            continue

        if document_type not in latest_by_type:
            latest_by_type[document_type] = document

    return list(
        latest_by_type.values()
    )



# MASK SENSITIVE VALUE


def _mask_sensitive_value(
    value: Any,
) -> Any:
    """
    Mask sensitive document identifiers before returning
    them to the frontend.

    The AI review does not need complete government ID numbers.
    """

    if value is None:
        return None

    value = str(value)

    if len(value) <= 4:
        return "****"

    return (
        "*" * max(0, len(value) - 4)
        + value[-4:]
    )



# SANITIZE EXTRACTED DATA


def _sanitize_extracted_data(
    extracted_data: Any,
) -> dict[str, Any]:
    """
    Prepare extracted document information for the admin review.

    Useful academic fields remain visible.

    Sensitive document identifiers are masked.
    """

    if not isinstance(
        extracted_data,
        dict,
    ):
        return {}

    safe_data = {}

    sensitive_keys = {
        "aadhaar",
        "aadhaar_number",
        "document_number",
        "certificate_number",
    }

    for key, value in extracted_data.items():

        normalized_key = (
            str(key)
            .strip()
            .lower()
        )

        if normalized_key in sensitive_keys:

            safe_data[key] = (
                _mask_sensitive_value(value)
            )

        else:

            safe_data[key] = value

    return safe_data



# NORMALIZE MARKS


def _get_marks(
    extracted_data: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Safely extract subject-wise marks from extracted_data.

    Expected structure:

    "marks": [
        {
            "subject": "English",
            "obtained": 82,
            "maximum": 100
        }
    ]
    """

    if not isinstance(
        extracted_data,
        dict,
    ):
        return []

    marks = extracted_data.get(
        "marks"
    )

    if not isinstance(
        marks,
        list,
    ):
        return []

    normalized_marks = []

    for mark in marks:

        if not isinstance(
            mark,
            dict,
        ):
            continue

        subject = (
            mark.get("subject")
            or mark.get("subject_name")
            or mark.get("name")
        )

        obtained = (
            mark.get("obtained")
            if mark.get("obtained") is not None
            else mark.get("obtained_marks")
        )

        maximum = (
            mark.get("maximum")
            if mark.get("maximum") is not None
            else mark.get("maximum_marks")
        )

        if subject is None:
            subject = "Unknown Subject"

        normalized_marks.append(
            {
                "subject": str(subject),
                "obtained": obtained,
                "maximum": maximum,
            }
        )

    return normalized_marks



# BUILD ACADEMIC FINDINGS


def _build_academic_findings(
    extracted_data: dict[str, Any],
) -> list[str]:
    """
    Build human-readable academic findings from extracted
    marks and calculated percentage.
    """

    findings = []

    if not isinstance(
        extracted_data,
        dict,
    ):
        return findings

    percentage = extracted_data.get(
        "percentage"
    )

    total_obtained = extracted_data.get(
        "total_obtained"
    )

    total_maximum = extracted_data.get(
        "total_maximum"
    )

    marks = _get_marks(
        extracted_data
    )

    # ------------------------------------------------------------
    # Percentage
    # ------------------------------------------------------------

    if percentage is not None:

        try:

            findings.append(
                "Calculated academic percentage: "
                f"{float(percentage):.2f}%."
            )

        except (
            TypeError,
            ValueError,
        ):

            findings.append(
                "Academic percentage was extracted from the document."
            )

    # ------------------------------------------------------------
    # Total marks
    # ------------------------------------------------------------

    if (
        total_obtained is not None
        and total_maximum is not None
    ):

        findings.append(
            "Total marks: "
            f"{total_obtained}/{total_maximum}."
        )

    # ------------------------------------------------------------
    # Subject count
    # ------------------------------------------------------------

    if marks:

        findings.append(
            f"{len(marks)} subject mark"
            f"{'s' if len(marks) != 1 else ''} "
            "were extracted from the document."
        )

        # --------------------------------------------------------
        # Subject-wise marks
        # --------------------------------------------------------

        for mark in marks:

            subject = mark.get(
                "subject",
                "Unknown Subject",
            )

            obtained = mark.get(
                "obtained"
            )

            maximum = mark.get(
                "maximum"
            )

            if (
                obtained is not None
                and maximum is not None
            ):

                findings.append(
                    f"{subject}: "
                    f"{obtained}/{maximum}."
                )

            elif obtained is not None:

                findings.append(
                    f"{subject}: "
                    f"{obtained} marks extracted; "
                    "maximum marks were unclear."
                )

    # ------------------------------------------------------------
    # Percentage calculation information
    # ------------------------------------------------------------

    calculation = extracted_data.get(
        "percentage_calculation"
    )

    if isinstance(
        calculation,
        dict,
    ):

        calculation_status = (
            calculation.get(
                "status"
            )
        )

        if calculation_status == "calculated":

            findings.append(
                "Percentage was calculated deterministically "
                "from the extracted subject marks."
            )

        elif calculation_status == "unavailable":

            reason = calculation.get(
                "reason"
            )

            if reason:

                findings.append(
                    "Percentage could not be calculated: "
                    f"{reason}"
                )

    return findings



# BUILD DOCUMENT EVIDENCE


def _build_document_evidence(
    documents: list[StudentDocument],
):
    """
    Build a normalized document evidence structure.

    This structure is the source of truth for the AI review
    and the frontend.

    Uploaded documents contain:

    - document_id
    - document_type
    - filename
    - required
    - verification_status
    - verification_reason
    - extracted_data
    - findings

    Missing required documents are represented explicitly.
    """

    required_map = {
        str(item["document_type"])
        .strip()
        .lower(): item
        for item in REQUIRED_DOCUMENTS
    }

    document_results = []

    submitted_types = set()

    for document in documents:

        document_type = (
            str(document.document_type or "")
            .strip()
            .lower()
        )

        if not document_type:
            continue

        submitted_types.add(
            document_type
        )

        required_config = (
            required_map.get(
                document_type
            )
        )

        required = (
            bool(
                required_config.get(
                    "required",
                    False,
                )
            )
            if required_config
            else False
        )

        verification_status = (
            str(
                document.verification_status
                or "uploaded"
            )
            .strip()
            .lower()
        )

        # --------------------------------------------------------
        # Verification findings
        # --------------------------------------------------------

        findings = []

        if verification_status == "verified":

            findings.append(
                "Document has been verified by the "
                "document verification workflow."
            )

        elif verification_status == "rejected":

            findings.append(
                "Document was rejected during "
                "document verification."
            )

        elif verification_status == "review_required":

            findings.append(
                "Document requires human review."
            )

        elif verification_status == "processing":

            findings.append(
                "Document processing is still in progress."
            )

        else:

            findings.append(
                "Document has been uploaded but is "
                "not yet verified."
            )

        # --------------------------------------------------------
        # Verification reason
        # --------------------------------------------------------

        if document.verification_reason:

            findings.append(
                document.verification_reason
            )

        # --------------------------------------------------------
        # Extracted information
        # --------------------------------------------------------

        extracted_data = (
            _sanitize_extracted_data(
                document.extracted_data
            )
        )

        if extracted_data:

            if extracted_data.get("name"):

                findings.append(
                    "Applicant name was extracted "
                    "from the document."
                )

            if extracted_data.get("passing_year"):

                findings.append(
                    "Passing year was extracted "
                    "from the document."
                )

            if extracted_data.get("percentage") is not None:

                try:

                    percentage = float(
                        extracted_data.get(
                            "percentage"
                        )
                    )

                    findings.append(
                        f"Academic percentage: "
                        f"{percentage:.2f}%."
                    )

                except (
                    TypeError,
                    ValueError,
                ):

                    findings.append(
                        "Academic percentage was extracted "
                        "from the document."
                    )

            # ----------------------------------------------------
            # Academic findings
            # ----------------------------------------------------

            findings.extend(
                _build_academic_findings(
                    extracted_data
                )
            )

        # --------------------------------------------------------
        # IMPORTANT:
        # Add the ACTUAL uploaded document.
        # --------------------------------------------------------

        document_results.append(
            {
                "document_id": document.id,
                "document_type": document_type,
                "filename": (
                    document.original_filename
                    or ""
                ),
                "required": required,
                "verification_status": (
                    verification_status
                ),
                "verification_reason": (
                    document.verification_reason
                ),
                "extracted_data": (
                    extracted_data
                ),
                "findings": list(
                    dict.fromkeys(
                        findings
                    )
                ),
            }
        )

    # ============================================================
    # MISSING REQUIRED DOCUMENTS
    # ============================================================

    missing_documents = []

    for item in REQUIRED_DOCUMENTS:

        document_type = (
            str(
                item["document_type"]
            )
            .strip()
            .lower()
        )

        if not item["required"]:
            continue

        if document_type not in submitted_types:

            missing_documents.append(
                document_type
            )

            document_results.append(
                {
                    "document_id": None,
                    "document_type": document_type,
                    "filename": "",
                    "required": True,
                    "verification_status": "missing",
                    "verification_reason": (
                        "Required document has not been submitted."
                    ),
                    "extracted_data": {},
                    "findings": [
                        "Required document is missing."
                    ],
                }
            )

    return {
        "documents": document_results,
        "missing_required_documents": (
            missing_documents
        ),
    }



# DOCUMENT PRE-CHECK


def _document_precheck(
    document_evidence: dict,
):
    """
    Perform deterministic checks before asking the LLM
    for an admission review.

    The LLM must never override these facts.
    """

    documents = document_evidence[
        "documents"
    ]

    missing = document_evidence[
        "missing_required_documents"
    ]

    rejected = []

    review_required = []

    unverified_required = []

    for document in documents:

        if not document["required"]:
            continue

        verification_status = (
            document[
                "verification_status"
            ]
        )

        if verification_status == "rejected":

            rejected.append(
                document["document_type"]
            )

        elif verification_status == "review_required":

            review_required.append(
                document["document_type"]
            )

        elif verification_status != "verified":

            unverified_required.append(
                document["document_type"]
            )

    return {
        "missing_required_documents": missing,
        "rejected_required_documents": rejected,
        "review_required_documents": review_required,
        "unverified_required_documents": (
            unverified_required
        ),
    }



# GET INSTITUTIONAL CRITERIA


def _get_institutional_criteria(
    db: Session,
    organization_id: int,
    program: str,
):
    """
    Use the existing institutional RAG system to retrieve
    official admission criteria.

    No second RAG implementation is created.
    """

    question = (
        "What are the official admission eligibility "
        "requirements and criteria for the "
        f"{program} program? Include academic requirements, "
        "required documents, eligibility conditions, and "
        "any conditions that require manual review."
    )

    result = search_institutional_knowledge(
        db=db,
        question=question,
        organization_id=organization_id,
    )

    return result



# BUILD AI PROMPT


def _build_review_prompt(
    admission: Admission,
    student: Student,
    document_evidence: dict,
    document_precheck: dict,
    institutional_criteria: dict,
):
    """
    Build a grounded AI admission-review prompt.

    The AI must reason only from supplied evidence.
    """

    safe_documents = []

    for document in document_evidence[
        "documents"
    ]:

        document_copy = dict(
            document
        )

        # --------------------------------------------------------
        # Raw OCR is intentionally not included in full.
        # Structured extracted_data + verification information
        # should normally be enough for the review.
        # --------------------------------------------------------

        safe_documents.append(
            document_copy
        )

    application_data = {
        "application_number": (
            admission.application_number
        ),
        "program": admission.program,
        "admission_type": (
            admission.admission_type
        ),
        "application_date": (
            admission.application_date
        ),
        "current_status": admission.status,
        "eligibility_status": (
            admission.eligibility_status
        ),
        "remarks": admission.remarks,
    }

    student_data = {
        "full_name": student.full_name,
        "email": student.email,
        "phone": student.phone,
        "program": student.program,
        "department": student.department,
        "academic_year": student.academic_year,
        "semester": student.semester,
    }

    criteria_answer = (
        institutional_criteria.get(
            "answer"
        )
    )

    criteria_citations = (
        institutional_criteria.get(
            "citations",
            [],
        )
    )

    return f"""
You are the CampusFlow AI Admission Review Engine.

Your role is to ASSIST a college administrator in reviewing
an admission application.

You are NOT the final decision-maker.

The administrator will make the final eligibility decision.

============================================================
APPLICATION
============================================================

{json.dumps(
    application_data,
    default=str,
    indent=2,
)}

============================================================
STUDENT
============================================================

{json.dumps(
    student_data,
    default=str,
    indent=2,
)}

============================================================
OFFICIAL INSTITUTIONAL CRITERIA
============================================================

{criteria_answer or "No institutional criteria answer was returned."}

Institutional knowledge citations:

{json.dumps(
    criteria_citations,
    default=str,
    indent=2,
)}

============================================================
DETERMINISTIC DOCUMENT PRE-CHECK
============================================================

{json.dumps(
    document_precheck,
    default=str,
    indent=2,
)}

IMPORTANT:

These document facts come from the backend.

Do NOT contradict them.

============================================================
DOCUMENT EVIDENCE
============================================================

{json.dumps(
    safe_documents,
    default=str,
    indent=2,
)}

============================================================
ACADEMIC DATA RULES
============================================================

When academic marks are present in extracted_data:

1. Use the supplied extracted subject-wise marks.

2. Use "total_obtained" and "total_maximum" when available.

3. Use the supplied "percentage" when available.

4. If percentage_calculation.status = "calculated",
   understand that the percentage was calculated deterministically
   by the backend from the extracted marks.

5. Do NOT invent marks.

6. Do NOT invent a maximum mark.

7. Do NOT recalculate a percentage differently from the supplied
   backend calculation.

8. If academic information is incomplete or contradictory,
   use "manual_review".

============================================================
REVIEW RULES
============================================================

1. Use ONLY the application, student, document evidence,
   deterministic pre-check, and institutional criteria provided.

2. Do NOT invent admission requirements.

3. Do NOT invent document information.

4. Do NOT assume a missing document is present.

5. A document with verification_status = "verified" may be
   treated as verified evidence.

6. A document with verification_status = "rejected" must not
   be treated as valid evidence.

7. A document with verification_status = "review_required"
   requires human attention.

8. If a required document is missing, the recommendation MUST
   be "manual_review".

9. If a required document is not verified, the recommendation
   MUST NOT be "eligible".

10. If the available evidence is ambiguous or contradictory,
    use "manual_review".

11. Use "not_eligible" only when the supplied institutional
    criteria clearly indicate that the applicant does not
    satisfy an eligibility condition.

12. Use "eligible" only when the supplied evidence clearly
    satisfies the relevant institutional criteria and all
    required documents are verified.

13. Do not infer eligibility from the applicant's name,
    appearance, gender, location, or any other irrelevant
    personal characteristic.

14. Do not make decisions based on protected or irrelevant
    personal characteristics.

15. The confidence describes the confidence in the EVIDENCE,
    not the administrator's final decision.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Do not use Markdown.

The JSON must have exactly this structure:

{{
    "recommendation": "eligible | not_eligible | manual_review",
    "confidence": "low | medium | high",
    "requires_manual_review": true,

    "criteria": [
        {{
            "criterion": "criterion name",
            "status": "passed | failed | unclear | not_applicable",
            "evidence": "specific evidence"
        }}
    ],

    "documents": [
        {{
            "document_id": 123,
            "document_type": "10th_marksheet",
            "filename": "file.pdf",
            "required": true,
            "verification_status": "verified",
            "verification_reason": "reason",
            "extracted_data": {{}},
            "findings": [
                "specific finding"
            ]
        }}
    ],

    "issues": [
        "specific issue"
    ],

    "explanation": "Clear explanation for the administrator."
}}

The document_id must refer only to the document IDs supplied
by the backend.

Do not add fields outside this structure.
"""



# EXTRACT JSON


def _extract_json(
    response: str,
) -> dict[str, Any]:
    """
    Extract JSON from an AI response.
    """

    if not response:

        raise RuntimeError(
            "AI admission review returned an empty response."
        )

    response = response.strip()

    # ------------------------------------------------------------
    # Direct JSON
    # ------------------------------------------------------------

    try:

        parsed = json.loads(
            response
        )

        if isinstance(
            parsed,
            dict,
        ):
            return parsed

    except json.JSONDecodeError:
        pass

    # ------------------------------------------------------------
    # Fenced JSON
    # ------------------------------------------------------------

    fenced = re.search(
        r"```(?:json)?\s*(\{.*?\})\s*```",
        response,
        flags=re.DOTALL | re.IGNORECASE,
    )

    if fenced:

        try:

            parsed = json.loads(
                fenced.group(1)
            )

            if isinstance(
                parsed,
                dict,
            ):
                return parsed

        except json.JSONDecodeError:
            pass

    # ------------------------------------------------------------
    # First JSON object
    # ------------------------------------------------------------

    start = response.find(
        "{"
    )

    end = response.rfind(
        "}"
    )

    if (
        start != -1
        and end > start
    ):

        candidate = response[
            start:end + 1
        ]

        try:

            parsed = json.loads(
                candidate
            )

            if isinstance(
                parsed,
                dict,
            ):
                return parsed

        except json.JSONDecodeError:
            pass

    raise RuntimeError(
        "AI admission review did not return valid JSON."
    )



# MERGE AI DOCUMENT RESULTS


def _merge_document_results(
    backend_documents: list[dict[str, Any]],
    ai_documents: list[Any],
) -> list[dict[str, Any]]:
    """
    Merge AI-generated document findings with authoritative
    backend document evidence.

    The backend remains the source of truth for:

    - document_id
    - filename
    - document_type
    - required
    - verification_status
    - verification_reason
    - extracted_data

    AI may contribute additional findings, but it cannot
    replace backend document facts.
    """

    ai_by_type = {}

    if isinstance(
        ai_documents,
        list,
    ):

        for ai_document in ai_documents:

            if not isinstance(
                ai_document,
                dict,
            ):
                continue

            document_type = (
                str(
                    ai_document.get(
                        "document_type",
                        "",
                    )
                )
                .strip()
                .lower()
            )

            if document_type:
                ai_by_type[
                    document_type
                ] = ai_document

    merged_documents = []

    for backend_document in backend_documents:

        document_type = (
            backend_document[
                "document_type"
            ]
        )

        ai_document = ai_by_type.get(
            document_type
        )

        merged = dict(
            backend_document
        )

        if ai_document:

            ai_findings = ai_document.get(
                "findings",
                [],
            )

            if isinstance(
                ai_findings,
                list,
            ):

                backend_findings = merged.get(
                    "findings",
                    [],
                )

                merged[
                    "findings"
                ] = list(
                    dict.fromkeys(
                        [
                            *backend_findings,
                            *[
                                str(item)
                                for item in ai_findings
                                if item
                            ],
                        ]
                    )
                )

        merged_documents.append(
            merged
        )

    return merged_documents



# NORMALIZE AI RESULT


def _normalize_ai_result(
    result: dict[str, Any],
    document_evidence: dict,
    document_precheck: dict,
):
    """
    Validate and enforce backend safety rules on the AI output.
    """

    recommendation = str(
        result.get(
            "recommendation",
            "manual_review",
        )
    ).strip().lower()

    if recommendation not in {
        "eligible",
        "not_eligible",
        "manual_review",
    }:

        recommendation = "manual_review"

    confidence = str(
        result.get(
            "confidence",
            "low",
        )
    ).strip().lower()

    if confidence not in {
        "low",
        "medium",
        "high",
    }:

        confidence = "low"

    # ------------------------------------------------------------
    # Deterministic safety rules
    # ------------------------------------------------------------

    blocking_document_conditions = (
        document_precheck[
            "missing_required_documents"
        ]
        or
        document_precheck[
            "rejected_required_documents"
        ]
        or
        document_precheck[
            "review_required_documents"
        ]
        or
        document_precheck[
            "unverified_required_documents"
        ]
    )

    if blocking_document_conditions:

        recommendation = "manual_review"

        confidence = "high"

    requires_manual_review = (
        recommendation == "manual_review"
    )

    # ------------------------------------------------------------
    # Normalize criteria
    # ------------------------------------------------------------

    criteria = result.get(
        "criteria",
        [],
    )

    if not isinstance(
        criteria,
        list,
    ):
        criteria = []

    # ------------------------------------------------------------
    # Normalize AI documents
    # ------------------------------------------------------------

    ai_documents = result.get(
        "documents",
        [],
    )

    if not isinstance(
        ai_documents,
        list,
    ):
        ai_documents = []

    # ------------------------------------------------------------
    # Backend document evidence is authoritative.
    # ------------------------------------------------------------

    documents = _merge_document_results(
        backend_documents=document_evidence[
            "documents"
        ],
        ai_documents=ai_documents,
    )

    # ------------------------------------------------------------
    # Normalize issues
    # ------------------------------------------------------------

    issues = result.get(
        "issues",
        [],
    )

    if not isinstance(
        issues,
        list,
    ):
        issues = []

    issues = [
        str(issue)
        for issue in issues
        if issue
    ]

    # ------------------------------------------------------------
    # Add deterministic issues
    # ------------------------------------------------------------

    if document_precheck[
        "missing_required_documents"
    ]:

        issues.append(
            "Missing required documents: "
            + ", ".join(
                document_precheck[
                    "missing_required_documents"
                ]
            )
        )

    if document_precheck[
        "rejected_required_documents"
    ]:

        issues.append(
            "Rejected required documents: "
            + ", ".join(
                document_precheck[
                    "rejected_required_documents"
                ]
            )
        )

    if document_precheck[
        "review_required_documents"
    ]:

        issues.append(
            "Required documents requiring human review: "
            + ", ".join(
                document_precheck[
                    "review_required_documents"
                ]
            )
        )

    if document_precheck[
        "unverified_required_documents"
    ]:

        issues.append(
            "Required documents are not yet verified: "
            + ", ".join(
                document_precheck[
                    "unverified_required_documents"
                ]
            )
        )

    # ------------------------------------------------------------
    # Academic issues
    # ------------------------------------------------------------

    for document in documents:

        extracted_data = document.get(
            "extracted_data",
            {},
        )

        if not isinstance(
            extracted_data,
            dict,
        ):
            continue

        calculation = extracted_data.get(
            "percentage_calculation"
        )

        if not isinstance(
            calculation,
            dict,
        ):
            continue

        if calculation.get(
            "status"
        ) == "unavailable":

            reason = calculation.get(
                "reason"
            )

            if reason:

                issues.append(
                    f"{document['document_type']}: "
                    f"Academic percentage could not be "
                    f"calculated. {reason}"
                )

    # ------------------------------------------------------------
    # Remove duplicate issues
    # ------------------------------------------------------------

    issues = list(
        dict.fromkeys(
            issues
        )
    )

    # ------------------------------------------------------------
    # Explanation
    # ------------------------------------------------------------

    explanation = str(
        result.get(
            "explanation",
            "The application requires administrator review.",
        )
    ).strip()

    if not explanation:

        explanation = (
            "The application requires administrator review."
        )

    return {
        "recommendation": recommendation,
        "confidence": confidence,
        "requires_manual_review": (
            requires_manual_review
        ),
        "criteria": criteria,
        "documents": documents,
        "issues": issues,
        "explanation": explanation,
    }



# RUN ADMISSION REVIEW


def run_admission_review_service(
    db: Session,
    admission_id: int,
    organization_id: int,
):
    """
    Run an AI-assisted admission review.

    IMPORTANT:

    This service NEVER changes the admission record.

    The administrator remains responsible for the final
    eligibility decision.
    """

    # ------------------------------------------------------------
    # 1. Load admission + student
    # ------------------------------------------------------------

    admission, student = _get_admission_context(
        db=db,
        admission_id=admission_id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # 2. Do not review already confirmed admissions
    # ------------------------------------------------------------

    if admission.status == "confirmed":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "AI admission review cannot be run after "
                "admission confirmation."
            ),
        )

    # ------------------------------------------------------------
    # 3. Load latest documents
    # ------------------------------------------------------------

    documents = _get_student_documents(
        db=db,
        student_id=student.id,
        organization_id=organization_id,
    )

    # ------------------------------------------------------------
    # 4. Build document evidence
    # ------------------------------------------------------------

    document_evidence = (
        _build_document_evidence(
            documents
        )
    )

    # ------------------------------------------------------------
    # 5. Deterministic pre-check
    # ------------------------------------------------------------

    document_precheck = (
        _document_precheck(
            document_evidence
        )
    )

    # ------------------------------------------------------------
    # 6. Get institutional criteria
    # ------------------------------------------------------------

    institutional_criteria = (
        _get_institutional_criteria(
            db=db,
            organization_id=organization_id,
            program=admission.program,
        )
    )

    # ------------------------------------------------------------
    # 7. Ensure criteria were actually retrieved
    # ------------------------------------------------------------

    if not institutional_criteria.get(
        "results_found",
        0,
    ):

        return {
            "admission_id": admission.id,
            "student_id": student.id,
            "application_number": (
                admission.application_number
            ),
            "recommendation": "manual_review",
            "confidence": "low",
            "requires_manual_review": True,
            "criteria": [],
            "documents": document_evidence[
                "documents"
            ],
            "issues": [
                (
                    "Official institutional admission criteria "
                    "could not be retrieved from the knowledge base."
                )
            ],
            "explanation": (
                "Manual review is required because the official "
                "institutional admission criteria were not available."
            ),
            "criteria_source": (
                "institutional_rag"
            ),
            "criteria_answer": None,
            "generated_at": datetime.utcnow(),
        }

    # ------------------------------------------------------------
    # 8. Build review prompt
    # ------------------------------------------------------------

    prompt = _build_review_prompt(
        admission=admission,
        student=student,
        document_evidence=document_evidence,
        document_precheck=document_precheck,
        institutional_criteria=(
            institutional_criteria
        ),
    )

    # ------------------------------------------------------------
    # 9. Generate AI review
    # ------------------------------------------------------------

    try:

        ai_response = (
            _ai_service.generate_answer(
                prompt=prompt
            )
        )

    except Exception as exc:

        raise RuntimeError(
            "AI admission review failed: "
            f"{exc}"
        ) from exc

    # ------------------------------------------------------------
    # 10. Parse AI JSON
    # ------------------------------------------------------------

    ai_result = _extract_json(
        ai_response
    )

    # ------------------------------------------------------------
    # 11. Normalize and enforce safety
    # ------------------------------------------------------------

    normalized_result = (
        _normalize_ai_result(
            result=ai_result,
            document_evidence=document_evidence,
            document_precheck=document_precheck,
        )
    )

    # ------------------------------------------------------------
    # 12. Return review
    # ------------------------------------------------------------

    return {
        "admission_id": admission.id,
        "student_id": student.id,
        "application_number": (
            admission.application_number
        ),
        **normalized_result,
        "criteria_source": (
            "institutional_rag"
        ),
        "criteria_answer": (
            institutional_criteria.get(
                "answer"
            )
        ),
        "generated_at": datetime.utcnow(),
    }