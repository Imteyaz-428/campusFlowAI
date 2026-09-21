import re
from difflib import SequenceMatcher
from typing import Any



# VERIFICATION RESULTS


VERIFIED = "verified"
REJECTED = "rejected"
REVIEW_REQUIRED = "review_required"



# COMPARISON THRESHOLDS


NAME_MATCH_THRESHOLD = 0.90



# NORMALIZATION


def _normalize_text(value: Any) -> str:
    """
    Normalize text before comparison.
    """

    if value is None:
        return ""

    value = str(value).strip().lower()

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value


def _normalize_alphanumeric(value: Any) -> str:
    """
    Normalize identifiers by removing spaces and punctuation.
    """

    if value is None:
        return ""

    value = str(value).strip().lower()

    return re.sub(
        r"[^a-z0-9]",
        "",
        value,
    )



# NAME COMPARISON


def compare_names(
    expected: Any,
    extracted: Any,
) -> tuple[bool, float]:
    """
    Compare a student's name with the name extracted from a
    document.
    """

    expected_name = _normalize_text(
        expected
    )

    extracted_name = _normalize_text(
        extracted
    )

    if not expected_name or not extracted_name:
        return False, 0.0

    if expected_name == extracted_name:
        return True, 1.0

    similarity = SequenceMatcher(
        None,
        expected_name,
        extracted_name,
    ).ratio()

    return (
        similarity >= NAME_MATCH_THRESHOLD,
        round(similarity, 4),
    )



# EXACT FIELD COMPARISON


def compare_exact(
    expected: Any,
    extracted: Any,
) -> bool:
    """
    Compare two values after normalization.
    """

    expected_value = _normalize_alphanumeric(
        expected
    )

    extracted_value = _normalize_alphanumeric(
        extracted
    )

    if not expected_value or not extracted_value:
        return False

    return expected_value == extracted_value



# FIELD RESULT


def _field_result(
    field: str,
    expected: Any,
    extracted: Any,
    matched: bool,
    confidence: float,
) -> dict[str, Any]:
    """
    Build a consistent field-level verification result.
    """

    return {
        "field": field,
        "expected": expected,
        "extracted": extracted,
        "matched": matched,
        "confidence": round(
            confidence,
            4,
        ),
    }



# ACADEMIC INFORMATION


def _build_academic_result(
    extracted_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Build academic information from extracted marks.

    This does NOT make an admission eligibility decision.

    It only reports what was extracted and calculated.
    """

    marks = extracted_data.get(
        "marks"
    )

    percentage = extracted_data.get(
        "percentage"
    )

    total_obtained = extracted_data.get(
        "total_obtained"
    )

    total_maximum = extracted_data.get(
        "total_maximum"
    )

    calculation = extracted_data.get(
        "percentage_calculation"
    )

    result = {
        "percentage": percentage,
        "total_obtained": total_obtained,
        "total_maximum": total_maximum,
        "marks": marks,
        "percentage_calculation": calculation,
    }

    # ------------------------------------------------------------
    # CALCULATION STATUS
    # ------------------------------------------------------------

    if isinstance(calculation, dict):

        result["calculation_status"] = (
            calculation.get("status")
        )

    elif percentage is not None:

        result["calculation_status"] = (
            "available"
        )

    else:

        result["calculation_status"] = (
            "unavailable"
        )

    return result



# STUDENT DOCUMENT VERIFICATION


def verify_student_document(
    student: Any,
    extracted_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Compare AI-extracted document information with the student's
    official campus record.

    Possible results:

        verified
        rejected
        review_required

    Academic percentage is reported separately.

    The percentage itself does NOT cause rejection because a
    percentage requirement belongs to admission eligibility,
    not document identity verification.
    """

    if not extracted_data:

        return {
            "verification_status": REVIEW_REQUIRED,
            "verification_reason": (
                "No structured information could be extracted "
                "from the document."
            ),
            "field_results": [],
            "academic": {},
            "matched_fields": 0,
            "mismatched_fields": 0,
            "missing_fields": 0,
        }

    field_results: list[
        dict[str, Any]
    ] = []

    matched_fields = 0
    mismatched_fields = 0
    missing_fields = 0

    # ============================================================
    # NAME
    # ============================================================

    extracted_name = extracted_data.get(
        "name"
    )

    if extracted_name:

        matched, confidence = compare_names(
            student.full_name,
            extracted_name,
        )

        field_results.append(
            _field_result(
                field="name",
                expected=student.full_name,
                extracted=extracted_name,
                matched=matched,
                confidence=confidence,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    else:

        missing_fields += 1

        field_results.append(
            _field_result(
                field="name",
                expected=student.full_name,
                extracted=None,
                matched=False,
                confidence=0.0,
            )
        )

    # ============================================================
    # EMAIL
    # ============================================================

    extracted_email = extracted_data.get(
        "email"
    )

    if extracted_email and getattr(
        student,
        "email",
        None,
    ):

        matched = (
            _normalize_text(
                student.email
            )
            == _normalize_text(
                extracted_email
            )
        )

        field_results.append(
            _field_result(
                field="email",
                expected=student.email,
                extracted=extracted_email,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # PHONE
    # ============================================================

    extracted_phone = extracted_data.get(
        "phone"
    )

    if extracted_phone and getattr(
        student,
        "phone",
        None,
    ):

        matched = compare_exact(
            student.phone,
            extracted_phone,
        )

        field_results.append(
            _field_result(
                field="phone",
                expected=student.phone,
                extracted=extracted_phone,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # STUDENT NUMBER
    # ============================================================

    extracted_student_number = (
        extracted_data.get(
            "student_number"
        )
    )

    if extracted_student_number and getattr(
        student,
        "student_number",
        None,
    ):

        matched = compare_exact(
            student.student_number,
            extracted_student_number,
        )

        field_results.append(
            _field_result(
                field="student_number",
                expected=student.student_number,
                extracted=extracted_student_number,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # APPLICATION NUMBER
    # ============================================================

    extracted_application_number = (
        extracted_data.get(
            "application_number"
        )
    )

    if extracted_application_number and getattr(
        student,
        "application_number",
        None,
    ):

        matched = compare_exact(
            student.application_number,
            extracted_application_number,
        )

        field_results.append(
            _field_result(
                field="application_number",
                expected=student.application_number,
                extracted=extracted_application_number,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # ADMISSION NUMBER
    # ============================================================

    extracted_admission_number = (
        extracted_data.get(
            "admission_number"
        )
    )

    if extracted_admission_number and getattr(
        student,
        "admission_number",
        None,
    ):

        matched = compare_exact(
            student.admission_number,
            extracted_admission_number,
        )

        field_results.append(
            _field_result(
                field="admission_number",
                expected=student.admission_number,
                extracted=extracted_admission_number,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # ROLL NUMBER
    # ============================================================

    extracted_roll_number = extracted_data.get(
        "roll_number"
    )

    if extracted_roll_number and getattr(
        student,
        "roll_number",
        None,
    ):

        matched = compare_exact(
            student.roll_number,
            extracted_roll_number,
        )

        field_results.append(
            _field_result(
                field="roll_number",
                expected=student.roll_number,
                extracted=extracted_roll_number,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # PROGRAM
    # ============================================================

    extracted_program = extracted_data.get(
        "program"
    )

    if extracted_program and getattr(
        student,
        "program",
        None,
    ):

        matched = (
            _normalize_text(
                student.program
            )
            == _normalize_text(
                extracted_program
            )
        )

        field_results.append(
            _field_result(
                field="program",
                expected=student.program,
                extracted=extracted_program,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # DEPARTMENT
    # ============================================================

    extracted_department = extracted_data.get(
        "department"
    )

    if extracted_department and getattr(
        student,
        "department",
        None,
    ):

        matched = (
            _normalize_text(
                student.department
            )
            == _normalize_text(
                extracted_department
            )
        )

        field_results.append(
            _field_result(
                field="department",
                expected=student.department,
                extracted=extracted_department,
                matched=matched,
                confidence=1.0 if matched else 0.0,
            )
        )

        if matched:
            matched_fields += 1
        else:
            mismatched_fields += 1

    # ============================================================
    # ACADEMIC RESULT
    # ============================================================

    academic_result = _build_academic_result(
        extracted_data
    )

    # ============================================================
    # FINAL DECISION
    # ============================================================

    total_compared = (
        matched_fields
        + mismatched_fields
    )

    # ------------------------------------------------------------
    # HARD MISMATCH
    # ------------------------------------------------------------

    if mismatched_fields > 0:

        verification_status = REJECTED

        verification_reason = (
            "One or more document fields do not match "
            "the student's official record."
        )

    # ------------------------------------------------------------
    # NOTHING USABLE
    # ------------------------------------------------------------

    elif total_compared == 0:

        verification_status = REVIEW_REQUIRED

        verification_reason = (
            "The document did not contain enough information "
            "to perform a reliable comparison."
        )

    # ------------------------------------------------------------
    # MISSING INFORMATION
    # ------------------------------------------------------------

    elif missing_fields > 0:

        verification_status = REVIEW_REQUIRED

        verification_reason = (
            "The available document information matches the "
            "student record, but some required information "
            "could not be extracted."
        )

    # ------------------------------------------------------------
    # SUCCESS
    # ------------------------------------------------------------

    else:

        verification_status = VERIFIED

        verification_reason = (
            "Extracted document information matches the "
            "student's official record."
        )

    # ============================================================
    # RETURN
    # ============================================================

    return {
        "verification_status": verification_status,

        "verification_reason": verification_reason,

        "field_results": field_results,

        "academic": academic_result,

        "matched_fields": matched_fields,

        "mismatched_fields": mismatched_fields,

        "missing_fields": missing_fields,

        "total_compared": total_compared,
    }