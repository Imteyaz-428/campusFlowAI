import json
import re
from typing import Any

from fastapi import HTTPException, status

from services.ai.ai_services import AIService



# CONSTANTS


MAX_INPUT_TEXT_LENGTH = 80_000



# EXCEPTIONS


class DocumentAIExtractionError(Exception):
    """
    Raised when the AI cannot produce valid structured
    document information.
    """

    pass



# AI SERVICE


_ai_service = AIService()



# DOCUMENT FIELD DEFINITIONS


DOCUMENT_FIELDS = {
    "aadhaar": [
        "name",
        "date_of_birth",
        "document_number",
        "gender",
    ],

    "id_proof": [
        "name",
        "date_of_birth",
        "document_number",
        "gender",
    ],

    "10th_marksheet": [
        "name",
        "date_of_birth",
        "roll_number",
        "school_name",
        "board",
        "passing_year",
        "marks",
        "percentage",
    ],

    "12th_marksheet": [
        "name",
        "date_of_birth",
        "roll_number",
        "school_name",
        "board",
        "passing_year",
        "marks",
        "percentage",
    ],

    "marksheet": [
        "name",
        "date_of_birth",
        "roll_number",
        "institution",
        "passing_year",
        "marks",
        "percentage",
    ],

    "certificate": [
        "name",
        "date_of_birth",
        "certificate_number",
        "issuing_authority",
        "issue_date",
    ],

    "transfer_certificate": [
        "name",
        "date_of_birth",
        "student_number",
        "institution",
        "issue_date",
    ],

    "migration_certificate": [
        "name",
        "date_of_birth",
        "certificate_number",
        "institution",
        "issue_date",
    ],

    "photo": [
        "name",
    ],

    "other": [
        "name",
        "date_of_birth",
        "document_number",
    ],
}



# MARKSHEET DOCUMENT TYPES


MARKSHEET_TYPES = {
    "10th_marksheet",
    "12th_marksheet",
    "marksheet",
}



# TEXT NORMALIZATION


def _prepare_text(text: str) -> str:
    """
    Clean OCR text before sending it to the LLM.
    """

    if not text:
        raise DocumentAIExtractionError(
            "No text was extracted from the document."
        )

    text = text.replace("\x00", "")

    text = text.strip()

    if not text:
        raise DocumentAIExtractionError(
            "Extracted document text is empty."
        )

    if len(text) > MAX_INPUT_TEXT_LENGTH:
        text = text[:MAX_INPUT_TEXT_LENGTH]

    return text



# JSON EXTRACTION


def _extract_json_from_response(
    response: str,
) -> dict[str, Any]:
    """
    Extract a JSON object from an LLM response.
    """

    if not response:
        raise DocumentAIExtractionError(
            "AI returned an empty response."
        )

    response = response.strip()

    # ------------------------------------------------------------
    # DIRECT JSON
    # ------------------------------------------------------------

    try:
        parsed = json.loads(response)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # ------------------------------------------------------------
    # JSON CODE BLOCK
    # ------------------------------------------------------------

    fenced_match = re.search(
        r"```(?:json)?\s*(\{.*?\})\s*```",
        response,
        flags=re.DOTALL | re.IGNORECASE,
    )

    if fenced_match:

        try:
            parsed = json.loads(
                fenced_match.group(1)
            )

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    # ------------------------------------------------------------
    # FIRST JSON OBJECT
    # ------------------------------------------------------------

    start = response.find("{")
    end = response.rfind("}")

    if start != -1 and end > start:

        candidate = response[
            start:end + 1
        ]

        try:
            parsed = json.loads(
                candidate
            )

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    raise DocumentAIExtractionError(
        "AI response did not contain valid JSON."
    )



# NULL-LIKE VALUES


def _is_null_like(value: Any) -> bool:
    """
    Determine whether a value represents missing information.
    """

    if value is None:
        return True

    if isinstance(value, str):

        return value.strip().lower() in {
            "",
            "null",
            "none",
            "not found",
            "not available",
            "unknown",
            "n/a",
            "na",
            "-",
        }

    return False



# NORMALIZE BASIC EXTRACTED VALUES


def _normalize_extracted_data(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Normalize values returned by the AI.

    Empty/null-like strings are converted to None.
    """

    normalized: dict[str, Any] = {}

    for key, value in data.items():

        if isinstance(value, str):

            value = value.strip()

            if _is_null_like(value):
                value = None

        normalized[key] = value

    return normalized



# NUMBER PARSING


def _parse_number(
    value: Any,
) -> float | None:
    """
    Safely convert a value to a number.

    Supports values such as:

        85
        "85"
        "85.5"
        "85 marks"
    """

    if value is None:
        return None

    if isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):

        number = float(value)

        if number < 0:
            return None

        return number

    if isinstance(value, str):

        value = value.strip()

        if not value:
            return None

        match = re.search(
            r"\d+(?:\.\d+)?",
            value,
        )

        if not match:
            return None

        try:

            number = float(
                match.group(0)
            )

            if number < 0:
                return None

            return number

        except ValueError:
            return None

    return None



# MARK ENTRY NORMALIZATION


def _normalize_mark_entry(
    entry: Any,
) -> dict[str, Any] | None:
    """
    Normalize one subject mark entry.

    Expected AI format:

        {
            "subject": "Physics",
            "obtained": 78,
            "maximum": 100
        }

    Also supports common alternate field names.
    """

    if not isinstance(entry, dict):
        return None

    subject = (
        entry.get("subject")
        or entry.get("name")
        or entry.get("subject_name")
    )

    obtained = (
        entry.get("obtained")
        if entry.get("obtained") is not None
        else entry.get("marks_obtained")
    )

    maximum = (
        entry.get("maximum")
        if entry.get("maximum") is not None
        else entry.get("max_marks")
    )

    # ------------------------------------------------------------
    # SUPPORT "78/100" STYLE VALUE
    # ------------------------------------------------------------

    if obtained is None:

        raw_marks = (
            entry.get("marks")
            or entry.get("score")
        )

        if isinstance(raw_marks, str):

            match = re.search(
                r"(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)",
                raw_marks,
            )

            if match:

                obtained = match.group(1)
                maximum = match.group(2)

    obtained_number = _parse_number(
        obtained
    )

    maximum_number = _parse_number(
        maximum
    )

    if obtained_number is None:
        return None

    if maximum_number is None:
        return None

    if maximum_number <= 0:
        return None

    if obtained_number > maximum_number:
        return None

    return {
        "subject": (
            str(subject).strip()
            if subject is not None
            else "Unknown"
        ),
        "obtained": obtained_number,
        "maximum": maximum_number,
    }



# CALCULATE MARKSHEET PERCENTAGE


def _calculate_marksheet_percentage(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Calculate percentage deterministically from extracted marks.

    The AI is responsible only for extracting the marks.

    Python performs:

        percentage =
            total_obtained / total_maximum * 100

    This prevents the LLM from making arithmetic mistakes.
    """

    raw_marks = data.get("marks")

    if raw_marks is None:
        return data

    # ------------------------------------------------------------
    # NORMALIZE MARKS LIST
    # ------------------------------------------------------------

    if isinstance(raw_marks, dict):

        # Sometimes the model may return:
        #
        # {
        #     "Physics": 78,
        #     "Chemistry": 82
        # }
        #
        # This format does not tell us maximum marks reliably,
        # so we do not calculate from it.

        normalized_marks = []

        for subject, value in raw_marks.items():

            if isinstance(value, dict):

                entry = {
                    "subject": subject,
                    **value,
                }

                normalized = _normalize_mark_entry(
                    entry
                )

                if normalized:
                    normalized_marks.append(
                        normalized
                    )

            elif isinstance(value, str):

                match = re.search(
                    r"(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)",
                    value,
                )

                if match:

                    normalized_marks.append(
                        {
                            "subject": str(subject),
                            "obtained": float(
                                match.group(1)
                            ),
                            "maximum": float(
                                match.group(2)
                            ),
                        }
                    )

        raw_marks = normalized_marks

    # ------------------------------------------------------------
    # MUST BE A LIST
    # ------------------------------------------------------------

    if not isinstance(raw_marks, list):

        data["percentage_calculation"] = {
            "status": "unavailable",
            "reason": (
                "Marks were extracted but their structure "
                "was not reliable enough to calculate percentage."
            ),
        }

        return data

    # ------------------------------------------------------------
    # NORMALIZE EACH SUBJECT
    # ------------------------------------------------------------

    normalized_marks: list[dict[str, Any]] = []

    for entry in raw_marks:

        normalized = _normalize_mark_entry(
            entry
        )

        if normalized:

            normalized_marks.append(
                normalized
            )

    # ------------------------------------------------------------
    # NO USABLE MARKS
    # ------------------------------------------------------------

    if not normalized_marks:

        data["percentage_calculation"] = {
            "status": "unavailable",
            "reason": (
                "No subject marks with a known maximum "
                "mark could be reliably extracted."
            ),
        }

        return data

    # ------------------------------------------------------------
    # CALCULATE TOTALS
    # ------------------------------------------------------------

    total_obtained = sum(
        item["obtained"]
        for item in normalized_marks
    )

    total_maximum = sum(
        item["maximum"]
        for item in normalized_marks
    )

    if total_maximum <= 0:

        data["percentage_calculation"] = {
            "status": "unavailable",
            "reason": (
                "Total maximum marks are invalid."
            ),
        }

        return data

    # ------------------------------------------------------------
    # FINAL PERCENTAGE
    # ------------------------------------------------------------

    percentage = (
        total_obtained
        / total_maximum
        * 100
    )

    percentage = round(
        percentage,
        2,
    )

    # ------------------------------------------------------------
    # SAVE DETERMINISTIC RESULT
    # ------------------------------------------------------------

    data["marks"] = normalized_marks

    data["total_obtained"] = round(
        total_obtained,
        2,
    )

    data["total_maximum"] = round(
        total_maximum,
        2,
    )

    data["percentage"] = percentage

    data["percentage_calculation"] = {
        "status": "calculated",
        "method": (
            "total_obtained / total_maximum * 100"
        ),
        "total_obtained": round(
            total_obtained,
            2,
        ),
        "total_maximum": round(
            total_maximum,
            2,
        ),
        "percentage": percentage,
        "subjects_used": len(
            normalized_marks
        ),
    }

    return data



# EXTRACTION PROMPT


def _build_extraction_prompt(
    document_type: str,
    text: str,
) -> str:
    """
    Build a strict extraction prompt.

    The AI extracts information only.

    For marksheets:
        AI extracts individual marks.
        Python calculates the final percentage.
    """

    normalized_type = (
        document_type
        .strip()
        .lower()
    )

    fields = DOCUMENT_FIELDS.get(
        normalized_type,
        DOCUMENT_FIELDS["other"],
    )

    fields_json = json.dumps(
        fields,
        indent=2,
    )

    marks_instruction = ""

    if normalized_type in MARKSHEET_TYPES:

        marks_instruction = """
SPECIAL MARKSHEET RULES:

For every subject where marks are visible, extract:

{
    "subject": "Subject Name",
    "obtained": 78,
    "maximum": 100
}

Put these objects inside the "marks" array.

Example:

"marks": [
    {
        "subject": "English",
        "obtained": 82,
        "maximum": 100
    },
    {
        "subject": "Physics",
        "obtained": 76,
        "maximum": 100
    },
    {
        "subject": "Chemistry",
        "obtained": 81,
        "maximum": 100
    }
]

IMPORTANT:

- Extract marks exactly as visible.
- Do not invent subjects.
- Do not assume maximum marks if they are not visible.
- If maximum marks are not visible, use null for maximum.
- Do NOT calculate percentage.
- Do NOT modify or round the extracted marks.
- If the document already contains a printed percentage, extract it
  into the "percentage" field, but do not treat it as the
  calculated percentage.
""".strip()

    return f"""
You are a document information extraction engine for a college
admission management system.

Your job is ONLY to extract information that is explicitly present
in the supplied document text.

Do NOT:
- invent information
- guess missing values
- correct names
- determine whether the document is genuine
- decide whether the document should be approved
- compare the document with student records
- create information that is not present
- calculate percentage

Document type:
{normalized_type}

Extract these fields when they are present:

{fields_json}

{marks_instruction}

Return ONLY a valid JSON object.

General rules:

1. Use the exact field names requested.
2. If a field is not present, return null.
3. Preserve names and identifiers as written.
4. Do not infer missing information.
5. Do not calculate percentage.
6. Do not include explanations outside the JSON.
7. Do not use Markdown code fences.
8. For marksheets, extract each visible subject mark separately.
9. Only include marks that are actually visible in the supplied text.
10. If maximum marks are unclear, use null rather than guessing.

Example marksheet response:

{{
    "name": "Rahul Sharma",
    "date_of_birth": "2007-05-12",
    "roll_number": "123456",
    "school_name": "ABC School",
    "board": "CBSE",
    "passing_year": "2025",
    "marks": [
        {{
            "subject": "English",
            "obtained": 82,
            "maximum": 100
        }},
        {{
            "subject": "Physics",
            "obtained": 76,
            "maximum": 100
        }}
    ],
    "percentage": null
}}

DOCUMENT TEXT:
--------------------
{text}
--------------------
""".strip()



# EXTRACT DOCUMENT FIELDS


def extract_document_fields(
    document_type: str,
    extracted_text: str,
) -> dict[str, Any]:
    """
    Extract structured fields from document text using the
    existing multi-provider AIService.

    Provider fallback is handled internally by AIService:

        Gemini
           ↓
        Groq
           ↓
        DeepSeek

    For marksheets:

        AI extracts marks
              ↓
        Python calculates percentage
    """

    if not document_type:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type is required.",
        )

    try:

        text = _prepare_text(
            extracted_text
        )

        prompt = _build_extraction_prompt(
            document_type=document_type,
            text=text,
        )

        response = _ai_service.generate_answer(
            prompt
        )

        data = _extract_json_from_response(
            response
        )

        data = _normalize_extracted_data(
            data
        )

        # --------------------------------------------------------
        # DETERMINISTIC PERCENTAGE CALCULATION
        # --------------------------------------------------------

        normalized_type = (
            document_type
           .strip()
            .lower()
        )

        if normalized_type in MARKSHEET_TYPES:

            data = _calculate_marksheet_percentage(
                data
            )

        return data

    except DocumentAIExtractionError:
        raise

    except Exception as exc:

        raise DocumentAIExtractionError(
            f"Document AI extraction failed: {exc}"
        ) from exc