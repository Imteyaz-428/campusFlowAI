from sqlalchemy.orm import Session

from crud.student_document import get_student_documents



# CONFIGURED DOCUMENT CHECKLIST

#
# This is the workflow checklist used by the Agent.
#
# Institution-specific policy requirements should still be
# answered through the institutional RAG tool.


REQUIRED_DOCUMENTS = [
    {
        "document_type": "10th_marksheet",
        "name": "Class X Marksheet / Pass Certificate",
        "required": True,
    },
    {
        "document_type": "12th_marksheet",
        "name": "Class XII Marksheet / Pass Certificate",
        "required": True,
    },
    {
        "document_type": "id_proof",
        "name": "Government-issued Photo ID",
        "required": True,
    },
    {
        "document_type": "photo",
        "name": "Passport-size Photograph",
        "required": True,
    },
    {
        "document_type": "transfer_certificate",
        "name": "Transfer Certificate",
        "required": True,
    },
    {
        "document_type": "migration_certificate",
        "name": "Migration Certificate",
        "required": False,
    },
]



# GET REQUIRED DOCUMENTS


def get_required_documents_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return the configured admission document checklist.

    This is READ-ONLY.
    """

    return {
        "documents": REQUIRED_DOCUMENTS,
        "note": (
            "This is the configured workflow checklist. "
            "Institution-specific policy questions should use "
            "the institutional knowledge tool."
        ),
    }



# GET DOCUMENT STATUS


def get_document_status_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Return the authenticated student's submitted documents,
    verification states, and missing required documents.
    """

    documents = get_student_documents(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    required_types = {
        item["document_type"]
        for item in REQUIRED_DOCUMENTS
        if item["required"]
    }

    submitted_types = {
        document.document_type.strip().lower()
        for document in documents
    }

    missing_documents = [
        item
        for item in REQUIRED_DOCUMENTS
        if item["required"]
        and item["document_type"] not in submitted_types
    ]

    return {
        "documents": [
            {
                "document_type": document.document_type,
                "filename": document.original_filename,
                "verification_status": (
                    document.verification_status
                ),
                "verification_reason": (
                    document.verification_reason
                ),
            }
            for document in documents
        ],
        "total_submitted": len(documents),
        "required_document_count": len(required_types),
        "missing_documents": missing_documents,
        "missing_count": len(missing_documents),
        "overall_status": (
            "complete"
            if not missing_documents
            else "incomplete"
        ),
    }



# CHECK DOCUMENT VERIFICATION


def verify_documents_tool(
    db: Session,
    student_id: int,
    organization_id: int,
):
    """
    Check the current verification state of the student's
    documents.

    IMPORTANT:
    This function is READ-ONLY.

    It does NOT:
        - approve documents
        - reject documents
        - modify documents
        - assign a reviewer

    Actual verification remains a staff/admin operation.
    """

    documents = get_student_documents(
        db=db,
        student_id=student_id,
        organization_id=organization_id,
    )

    counts = {
        "verified": 0,
        "rejected": 0,
        "review_required": 0,
        "processing": 0,
        "uploaded": 0,
    }

    document_results = []

    for document in documents:

        verification_status = (
            document.verification_status
            or "uploaded"
        ).strip().lower()

        counts[verification_status] = (
            counts.get(
                verification_status,
                0,
            ) + 1
        )

        document_results.append(
            {
                "document_type": document.document_type,
                "filename": document.original_filename,
                "verification_status": (
                    verification_status
                ),
                "verification_reason": (
                    document.verification_reason
                ),
            }
        )

    # --------------------------------------------------------
    # Determine overall verification state
    # --------------------------------------------------------

    if counts["rejected"] > 0:

        overall_status = "action_required"

    elif counts["review_required"] > 0:

        overall_status = "human_review_required"

    elif counts["processing"] > 0:

        overall_status = "processing"

    elif counts["uploaded"] > 0:

        overall_status = "pending_verification"

    elif (
        documents
        and counts["verified"] == len(documents)
    ):

        overall_status = "verified"

    else:

        overall_status = "no_documents"

    return {
        "documents": document_results,

        "verified_count": counts["verified"],

        "rejected_count": counts["rejected"],

        "review_required_count": (
            counts["review_required"]
        ),

        "processing_count": (
            counts["processing"]
        ),

        "uploaded_count": (
            counts["uploaded"]
        ),

        "overall_verification_status": (
            overall_status
        ),

        "verification_action": (
            "No student action is required for "
            "verified documents."
            if overall_status == "verified"
            else
            "Rejected or review-required documents "
            "may require staff action."
        ),
    }
