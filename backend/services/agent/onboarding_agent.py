from __future__ import annotations

import json

from sqlalchemy.orm import Session

from models.onboarding_task import OnboardingTask

from services.ai.ai_services import AIService

from services.agent.tools.document_tools import (
    get_document_status_tool,
    verify_documents_tool,
)

from services.agent.tools.fee_tools import (
    get_fee_status_tool,
)

from services.agent.tools.student_tools import (
    get_admission_status_tool,
    get_student_profile_tool,
)

from crud.onboarding import (
    STATUS_COMPLETED,
    STATUS_PROCESSING,
    STATUS_WAITING_FOR_STUDENT,
    STATUS_NEEDS_HUMAN_REVIEW,
    auto_complete_task,
    get_student_onboarding,
    initialize_student_onboarding,
    mark_needs_human_review,
    mark_waiting_for_student,
)


class OnboardingAutomationAgent:
    """
    CampusFlow automatic onboarding agent.

    IMPORTANT:

    This agent is NOT a chatbot.

    It is a workflow automation engine.

    It:

        1. Reads trusted campus data.
        2. Evaluates onboarding conditions.
        3. Automatically completes safe tasks.
        4. Requests student action when information is missing.
        5. Sends only exceptional cases to human review.

    Normal onboarding does NOT require admin approval.
    """

    def __init__(self):
        self.ai_service = AIService()

    # ============================================================
    # AI SUMMARY
    # ============================================================

    def _generate_assessment(
        self,
        context: dict,
    ) -> str:
        """
        Generate an optional natural-language assessment.

        The LLM does NOT control workflow state.
        """

        prompt = f"""
You are the CampusFlow onboarding assistant.

Analyze the following trusted campus data.

DATA:
{json.dumps(context, indent=2, default=str)}

Provide a concise internal workflow summary.

Mention:
1. verified information
2. missing information
3. exceptions
4. whether normal automatic processing is possible

Do NOT invent information.

Do NOT approve or reject anything.

Keep the answer below 120 words.
"""

        try:
            result = self.ai_service.generate_answer(
                prompt=prompt
            )

            if result:
                return result.strip()

        except Exception:
            pass

        if context["blocking_reasons"]:
            return (
                "Automatic onboarding checks found: "
                + "; ".join(
                    context["blocking_reasons"]
                )
            )

        return (
            "Automatic onboarding checks passed."
        )

    # ============================================================
    # RUN AGENT
    # ============================================================

    def run(
        self,
        db: Session,
        student_id: int,
        organization_id: int,
    ):
        """
        Execute the onboarding workflow.

        This method is idempotent.

        It can safely be called:

            after admission confirmation
            after document verification
            after student profile update
            from a retry endpoint
        """

      
        # 1. Ensure onboarding tasks exist
      

        initialization = initialize_student_onboarding(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        db.flush()

      
        # 2. Read trusted campus information
      

        profile = get_student_profile_tool(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        admission = get_admission_status_tool(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        fees = get_fee_status_tool(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        documents = get_document_status_tool(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        verification = verify_documents_tool(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

      
        # 3. Build context
      

        blocking_reasons = []

        admission_confirmed = (
            admission.get(
                "student_admission_status"
            ) == "confirmed"
        )

        if not admission_confirmed:
            blocking_reasons.append(
                "Admission is not confirmed."
            )

        if fees.get("mandatory_pending"):
            blocking_reasons.append(
                "Mandatory fees are still pending."
            )

        context = {
            "profile": profile,
            "admission": admission,
            "fees": fees,
            "documents": documents,
            "verification": verification,
            "blocking_reasons": blocking_reasons,
        }

        assessment = self._generate_assessment(
            context
        )

      
        # 4. Get onboarding tasks
      

        tasks = get_student_onboarding(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

      
        # 5. Detect photo state
      

        photo_status = None

        for item in verification.get(
            "documents",
            [],
        ):

            document_type = (
                item.get(
                    "document_type",
                    "",
                )
                .strip()
                .lower()
            )

            if document_type == "photo":

                photo_status = (
                    item.get(
                        "verification_status"
                    )
                    or "uploaded"
                ).strip().lower()

                break

      
        # 6. Process tasks
      

        processed = 0

        auto_completed = 0

        waiting_for_student = 0

        human_review = 0

        failed = 0

        for task in tasks:

            if task.status == STATUS_COMPLETED:
                continue

            processed += 1

            try:

                # ==================================================
                # ADMISSION NOT CONFIRMED
                # ==================================================

                if not admission_confirmed:

                    mark_waiting_for_student(
                        db=db,
                        task_id=task.id,
                        organization_id=organization_id,
                        reason=(
                            "Onboarding is waiting for "
                            "admission confirmation."
                        ),
                    )

                    waiting_for_student += 1

                    continue

                # ==================================================
                # ACADEMIC REGISTRATION
                # ==================================================

                if task.task_key == "academic_registration":

                    if not profile.get("department"):

                        mark_waiting_for_student(
                            db=db,
                            task_id=task.id,
                            organization_id=organization_id,
                            reason=(
                                "Department information is "
                                "required for academic registration."
                            ),
                        )

                        waiting_for_student += 1

                        continue

                    completed_task = auto_complete_task(
                        db=db,
                        task_id=task.id,
                        organization_id=organization_id,
                        reason=(
                            "Academic registration automatically "
                            "completed by CampusFlow automation."
                        ),
                    )

                    if (
                        completed_task.status
                        == STATUS_COMPLETED
                    ):
                        auto_completed += 1

                    continue

                # ==================================================
                # LIBRARY REGISTRATION
                # ==================================================

                if task.task_key == "library_registration":

                    completed_task = auto_complete_task(
                        db=db,
                        task_id=task.id,
                        organization_id=organization_id,
                        reason=(
                            "Library registration automatically "
                            "completed after confirmed admission."
                        ),
                    )

                    if (
                        completed_task.status
                        == STATUS_COMPLETED
                    ):
                        auto_completed += 1

                    continue

                # ==================================================
                # ID CARD REGISTRATION
                # ==================================================

                if task.task_key == "id_card_registration":

                    if photo_status == "verified":

                        completed_task = auto_complete_task(
                            db=db,
                            task_id=task.id,
                            organization_id=organization_id,
                            reason=(
                                "ID card registration automatically "
                                "completed because the required "
                                "photograph is verified."
                            ),
                        )

                        if (
                            completed_task.status
                            == STATUS_COMPLETED
                        ):
                            auto_completed += 1

                        continue

                    if photo_status in {
                        "uploaded",
                        "processing",
                    }:

                        mark_waiting_for_student(
                            db=db,
                            task_id=task.id,
                            organization_id=organization_id,
                            reason=(
                                "ID card registration is waiting "
                                "for photograph verification."
                            ),
                        )

                        waiting_for_student += 1

                        continue

                    if photo_status == "rejected":

                        mark_waiting_for_student(
                            db=db,
                            task_id=task.id,
                            organization_id=organization_id,
                            reason=(
                                "The submitted photograph was "
                                "rejected. Please upload a new "
                                "photograph."
                            ),
                        )

                        waiting_for_student += 1

                        continue

                    if photo_status == "review_required":

                        mark_needs_human_review(
                            db=db,
                            task_id=task.id,
                            organization_id=organization_id,
                            reason=(
                                "Photograph verification requires "
                                "human review."
                            ),
                        )

                        human_review += 1

                        continue

                    mark_waiting_for_student(
                        db=db,
                        task_id=task.id,
                        organization_id=organization_id,
                        reason=(
                            "Please upload a valid photograph "
                            "for automatic ID card registration."
                        ),
                    )

                    waiting_for_student += 1

                    continue

                # ==================================================
                # UNKNOWN FUTURE TASK
                # ==================================================

                mark_needs_human_review(
                    db=db,
                    task_id=task.id,
                    organization_id=organization_id,
                    reason=(
                        "This onboarding task does not yet have "
                        "an automatic processing rule."
                    ),
                )

                human_review += 1

            except Exception as exc:

                task.status = "failed"

                task.review_notes = (
                    "Automatic onboarding processing failed: "
                    f"{str(exc)}"
                )

                failed += 1

      
        # 7. Save all workflow changes
      

        db.commit()

      
        # 8. Re-read tasks
      

        final_tasks = get_student_onboarding(
            db=db,
            student_id=student_id,
            organization_id=organization_id,
        )

        completed_count = sum(
            task.status == STATUS_COMPLETED
            for task in final_tasks
        )

        total_count = len(final_tasks)

        if total_count == 0:

            onboarding_status = "not_started"

        elif completed_count == total_count:

            onboarding_status = "completed"

        elif human_review > 0:

            onboarding_status = "needs_human_review"

        elif waiting_for_student > 0:

            onboarding_status = "waiting_for_student"

        else:

            onboarding_status = "processing"

        return {
            "student_id": student_id,
            "initialization": initialization,
            "assessment": assessment,
            "tasks_processed": processed,
            "tasks_auto_completed": auto_completed,
            "tasks_waiting_for_student": (
                waiting_for_student
            ),
            "tasks_needing_human_review": (
                human_review
            ),
            "tasks_failed": failed,
            "onboarding_status": onboarding_status,
            "tasks": [
                {
                    "task_id": task.id,
                    "task_key": task.task_key,
                    "status": task.status,
                    "title": task.title,
                    "review_notes": task.review_notes,
                }
                for task in final_tasks
            ],
        }