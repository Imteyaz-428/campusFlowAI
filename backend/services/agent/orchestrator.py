import json
import re

from sqlalchemy.orm import Session

from services.ai.ai_services import AIService
from crud.agent_audit import create_agent_audit_log
from services.agent.tool_registry import get_tool
from services.agent.tool_schemas import get_tool_schemas


class AgentOrchestrator:

    MAX_STEPS = 5


    # APPLICANT TOOLS


    # Applicants are completely READ-ONLY through the AI agent.

    APPLICANT_ALLOWED_TOOLS = {
        "search_institutional_knowledge",

        "get_student_profile",
        "get_admission_status",

        "get_required_documents",
        "get_document_status",
        "verify_documents",

        "get_fee_status",

        "get_onboarding_tasks",
        "get_onboarding_summary",
        "get_next_onboarding_action",

        "get_my_tickets",
        "get_ticket_status",
    }


    # REGISTERED STUDENT TOOLS


    # Registered students can query their own campus information.
    #
    # IMPORTANT:
    # The conversational agent does NOT directly complete
    # onboarding tasks.
    #
    # Onboarding completion is handled by the automation agent.

    # Registered students can query their own campus information
    # and complete their own onboarding tasks.
    #
    # Onboarding can be completed two ways:
    #
    #   1. Batch  - OnboardingAutomationAgent (rule-based)
    #   2. Direct - the student asks the conversational agent
    #
    # Both paths call the same services, so they stay consistent.
    #
    # student_id and organization_id are ALWAYS injected by the
    # server and are never controlled by the LLM.

    STUDENT_ALLOWED_TOOLS = {
        "search_institutional_knowledge",

        "get_student_profile",
        "get_admission_status",

        "get_required_documents",
        "get_document_status",
        "verify_documents",

        "get_fee_status",

        "get_onboarding_tasks",
        "get_onboarding_summary",
        "get_next_onboarding_action",

        "complete_onboarding_task",
        "complete_academic_registration",
        "complete_library_registration",
        "complete_id_card_registration",

        "create_ticket",
        "get_my_tickets",
        "get_ticket_status",
    }

    # INITIALIZATION


    def __init__(self):

        self.ai_service = AIService()

        self.tool_schemas = get_tool_schemas()


    # ALLOWED TOOLS


    def _get_allowed_tools(
        self,
        is_applicant: bool,
    ):

        if is_applicant:
            return self.APPLICANT_ALLOWED_TOOLS

        return self.STUDENT_ALLOWED_TOOLS


    # FILTER TOOL SCHEMAS


    def _get_allowed_tool_schemas(
        self,
        is_applicant: bool,
    ):

        allowed_tools = (
            self._get_allowed_tools(
                is_applicant=is_applicant
            )
        )

        return [
            schema
            for schema in self.tool_schemas
            if schema.get("name") in allowed_tools
        ]


    # DECISION PROMPT


    def _build_decision_prompt(
        self,
        user_message: str,
        student_id: int,
        execution_history: list,
        is_applicant: bool,
    ) -> str:

        allowed_tool_schemas = (
            self._get_allowed_tool_schemas(
                is_applicant=is_applicant
            )
        )

        tools = json.dumps(
            allowed_tool_schemas,
            indent=2,
        )

        history = json.dumps(
            execution_history,
            default=str,
            indent=2,
        )

        identity_type = (
            "APPLICANT"
            if is_applicant
            else "REGISTERED STUDENT"
        )

        return f"""
You are CampusFlow AI, an intelligent campus process
assistant.

Authenticated identity:
{identity_type}

Server-controlled Student ID:
{student_id}

Student request:
{user_message}

Available tools:
{tools}

Previous agent execution:
{history}

Your job is to decide the NEXT action.

============================================================
SECURITY RULES
============================================================

1. Use tools for campus data.

2. Never invent campus information.

3. Never invent task IDs.

4. Never invent student IDs.

5. Never invent organization IDs.

6. student_id is controlled by the server.

7. organization_id is controlled by the server.

8. Never request student_id from the user.

9. Never request organization_id from the user.

10. Use ONLY tools listed in Available tools.

11. Never attempt to call unavailable tools.

12. Never expose internal tool names.

13. Never expose database information.

14. Never expose implementation details.

============================================================
IDENTITY RULES
============================================================

15. The authenticated identity is determined by the server.

16. Never assume the user is an administrator.

17. Never assume the user is a teacher.

18. Never perform staff-only operations.

19. Never access another student's information.

20. Never change the authenticated student's identity.

============================================================
APPLICANT RULES
============================================================

21. Applicants have READ-ONLY access through the AI agent.

22. Applicants cannot:

- modify applications
- approve applications
- reject applications
- modify documents
- approve documents
- reject documents
- modify fees
- confirm payments
- confirm admission
- complete onboarding
- perform academic registration
- perform library registration
- perform ID card registration

23. If an applicant requests a write operation:

- DO NOT call a write tool.
- Explain that the operation requires the appropriate
  campus workflow.

============================================================
REGISTERED STUDENT RULES
============================================================

24. Registered students may only access their own information.

25. The server controls student_id and organization_id.

26. Do not expose another student's information.

============================================================
RAG / INSTITUTIONAL KNOWLEDGE
============================================================

27. Use search_institutional_knowledge for:

- college policies
- admission rules
- admission requirements
- institutional procedures
- academic procedures
- fee policies
- refund policies
- campus rules
- notices
- official college information
- general institutional questions

28. Never answer institutional questions from memory when
    official knowledge should be used.

29. Do not invent institutional information.

30. search_institutional_knowledge is READ-ONLY.

31. Never expose embeddings, pgvector, retrieval systems,
    vector databases, or internal RAG implementation.

============================================================
PERSONAL STUDENT INFORMATION
============================================================

32. Use get_student_profile for:

- name
- application number
- admission number
- roll number
- program
- department
- academic year
- semester
- student status

33. Never guess personal student information.

============================================================
ADMISSION
============================================================

34. Use get_admission_status for:

- application status
- admission status
- admission approval
- admission rejection
- admission confirmation
- admission progress

35. Never infer admission status.

36. Never invent admission numbers.

37. Never invent roll numbers.

38. Approval and confirmation are different stages.

============================================================
DOCUMENTS
============================================================

39. Use get_required_documents when the student asks about
    their configured admission document checklist.

40. Use search_institutional_knowledge for official institutional
    document requirements or policy.

41. Use get_document_status when asking about personally submitted
    or missing documents.

42. Use verify_documents when asking whether submitted documents
    are verified.

43. verify_documents is READ-ONLY.

44. Never claim a document is verified unless the tool explicitly
    reports verification_status as verified.

============================================================
FEES
============================================================

45. Use get_fee_status for the student's own:

- fees
- payment status
- pending fees
- mandatory pending fees
- payment references
- due dates

46. Use search_institutional_knowledge for general fee policies.

47. Never invent fee amounts.

48. Never invent payment status.

49. Never claim payment was made unless the tool confirms it.

50. Never perform payment through the AI agent.

============================================================
ONBOARDING
============================================================

51. The conversational AI agent is READ-ONLY for onboarding.

52. Use onboarding tools only to READ onboarding information.

53. Use get_onboarding_tasks when the student asks about:

- onboarding tasks
- onboarding status
- completed tasks
- pending tasks

54. Use get_onboarding_summary when the student asks:

- how much onboarding is complete
- onboarding progress
- overall onboarding status

55. Use get_next_onboarding_action when the student asks:

- what should I do next
- what is pending
- what action is required from me

56. NEVER complete onboarding through the conversational agent.

57. NEVER call:

- complete_onboarding_task
- complete_academic_registration
- complete_library_registration
- complete_id_card_registration

58. Onboarding automation is handled by the backend automation
    workflow.

59. If onboarding is waiting for the student, explain the action
    that the student needs to perform.

60. If onboarding requires human review, explain that the case
    has been sent to the appropriate campus staff workflow.

61. Never claim that onboarding was completed unless the
    READ-ONLY onboarding tools show status = completed.

============================================================
TICKETS
============================================================

62. Use get_my_tickets when the student asks about their
    support tickets or complaints.

63. Use get_ticket_status when the student provides a ticket number.

64. Use create_ticket only when the student explicitly reports
    an issue requiring staff attention.

65. Do not create tickets for ordinary informational questions.

66. Students can only create tickets for themselves.

67. Never modify ticket status through the conversational agent.

============================================================
MULTI-TOOL REASONING
============================================================

68. One question may require multiple tools.

Example:

"What documents are required and which ones have I submitted?"

Use:

search_institutional_knowledge
+
get_document_status

Example:

"What is my admission status and fee status?"

Use:

get_admission_status
+
get_fee_status

Example:

"What is my onboarding status and what should I do next?"

Use:

get_onboarding_summary
+
get_next_onboarding_action

Example:

"What is the refund policy and do I have any pending fees?"

Use:

search_institutional_knowledge
+
get_fee_status

69. Do not call unrelated tools.

70. Minimize unnecessary tool calls.

============================================================
TOOL ARGUMENT RULES
============================================================

71. Never provide student_id.

72. Never provide organization_id.

73. The server automatically injects them.

74. Tools requiring no user arguments should receive no
    user-controlled identity information.

============================================================
FINAL RESPONSE
============================================================

75. Only use verified tool results.

76. Never invent information.

77. Never expose internal tool names.

78. Never expose internal database information.

79. Never expose student_id.

80. Never expose organization_id.

81. Never claim an action was completed unless verified.

82. Clearly distinguish:

- admission approval
- admission confirmation
- document verification
- fee payment
- onboarding completion
- human review

Return ONLY valid JSON.

For a tool call:

{{
    "action": "tool_call",
    "tool_name": "tool name",
    "arguments": {{}}
}}

For a final response:

{{
    "action": "respond",
    "message": "response"
}}

JSON ONLY.
"""


    # JSON PARSER


    def _extract_json(
        self,
        response: str,
    ):

        response = response.strip()

        response = re.sub(
            r"```json\s*",
            "",
            response,
            flags=re.IGNORECASE,
        )

        response = re.sub(
            r"```\s*$",
            "",
            response,
        )

        try:

            return json.loads(
                response
            )

        except json.JSONDecodeError:

            match = re.search(
                r"\{.*\}",
                response,
                re.DOTALL,
            )

            if not match:
                raise ValueError(
                    "LLM did not return valid JSON."
                )

            return json.loads(
                match.group(0)
            )


    # TOOL VALIDATION


    def _validate_tool(
        self,
        tool_name: str,
        is_applicant: bool,
    ):

        tool = get_tool(
            tool_name
        )

        if tool is None:
            raise ValueError(
                f"Unknown agent tool: {tool_name}"
            )

        allowed_tools = (
            self._get_allowed_tools(
                is_applicant=is_applicant
            )
        )

        if tool_name not in allowed_tools:

            raise PermissionError(
                "This operation is not available through "
                "the CampusFlow student assistant."
            )

        return tool


    # TOOL EXECUTION


    def _execute_tool(
        self,
        db: Session,
        tool_name: str,
        arguments: dict,
        student_id: int,
        organization_id: int,
        is_applicant: bool,
    ):

        tool = self._validate_tool(
            tool_name=tool_name,
            is_applicant=is_applicant,
        )

        arguments = dict(arguments)

        # Never trust identity values supplied by the LLM.
        arguments.pop(
            "student_id",
            None,
        )

        arguments.pop(
            "organization_id",
            None,
        )

        # Server-controlled identity.
        arguments["student_id"] = student_id
        arguments["organization_id"] = organization_id

        # ========================================================
        # WRITE TOOLS
        # ========================================================

        WRITE_TOOLS = {
            "create_ticket",
        }

        action_type = (
            "write"
            if tool_name in WRITE_TOOLS
            else "read"
        )

        # ========================================================
        # AUDIT INPUT
        # ========================================================

        audit_arguments = {
            key: value
            for key, value in arguments.items()
            if key not in {
                "student_id",
                "organization_id",
                "password",
                "password_hash",
                "applicant_password_hash",
            }
        }

        input_summary = json.dumps(
            audit_arguments,
            default=str,
        )

        # ========================================================
        # EXECUTE
        # ========================================================

        try:

            result = tool(
                db=db,
                **arguments,
            )

            output_summary = json.dumps(
                result,
                default=str,
            )

            create_agent_audit_log(
                db=db,
                organization_id=organization_id,
                student_id=student_id,
                tool_name=tool_name,
                action_type=action_type,
                status="success",
                input_summary=input_summary,
                output_summary=output_summary,
            )

            db.commit()

            return result

        except Exception as exc:

            db.rollback()

            create_agent_audit_log(
                db=db,
                organization_id=organization_id,
                student_id=student_id,
                tool_name=tool_name,
                action_type=action_type,
                status="failed",
                input_summary=input_summary,
                error_message=str(exc),
            )

            db.commit()

            raise


    # FINAL RESPONSE PROMPT


    def _build_final_response_prompt(
        self,
        user_message: str,
        execution_history: list,
    ):

        history = json.dumps(
            execution_history,
            default=str,
            indent=2,
        )

        return f"""
You are CampusFlow AI.

Student request:

{user_message}

Verified agent execution history:

{history}

Generate the final response.

Rules:

1. Use only verified tool results.

2. Never invent information.

3. Do not mention internal tool names.

4. Do not mention databases.

5. Do not mention implementation details.

6. Clearly explain the answer.

7. If the information came from institutional knowledge,
   present it as official campus guidance.

8. If citations are available, preserve their grounding.

9. Never expose internal retrieval or vector database details.

10. Never expose student_id or organization_id.

11. Never expose passwords or tokens.

12. Never claim an onboarding task was completed unless the
    verified onboarding result says status = completed.

13. If onboarding is waiting for the student, clearly explain
    what the student needs to do.

14. If onboarding requires human review, explain that campus
    staff intervention is required.

15. If a ticket was created, report the ticket number returned
    by the verified tool result.

16. Keep the response concise and natural.

Return plain text only.
"""


    # MAIN AGENT LOOP


    def run(
        self,
        db: Session,
        student_id: int,
        organization_id: int,
        user_message: str,
        is_applicant: bool = False,
    ):

        execution_history = []

        for step in range(
            self.MAX_STEPS
        ):

            decision_prompt = (
                self._build_decision_prompt(
                    user_message=user_message,
                    student_id=student_id,
                    execution_history=execution_history,
                    is_applicant=is_applicant,
                )
            )

            decision_response = (
                self.ai_service.generate_answer(
                    decision_prompt
                )
            )

            decision = self._extract_json(
                decision_response
            )

            # ====================================================
            # FINAL RESPONSE
            # ====================================================

            if decision.get(
                "action"
            ) == "respond":

                if execution_history:

                    final_prompt = (
                        self._build_final_response_prompt(
                            user_message=user_message,
                            execution_history=execution_history,
                        )
                    )

                    final_response = (
                        self.ai_service.generate_answer(
                            final_prompt
                        )
                    )

                    return {
                        "type": "agent_response",
                        "steps": execution_history,
                        "message": final_response,
                    }

                return {
                    "type": "response",
                    "message": decision.get(
                        "message",
                        "",
                    ),
                }

            # ====================================================
            # TOOL CALL
            # ====================================================

            if decision.get(
                "action"
            ) != "tool_call":

                raise ValueError(
                    "Invalid agent action."
                )

            tool_name = decision.get(
                "tool_name"
            )

            arguments = decision.get(
                "arguments",
                {},
            )

            if not isinstance(
                arguments,
                dict,
            ):

                raise ValueError(
                    "Tool arguments must be an object."
                )

            # ====================================================
            # EXECUTE
            # ====================================================

            tool_result = (
                self._execute_tool(
                    db=db,
                    tool_name=tool_name,
                    arguments=arguments,
                    student_id=student_id,
                    organization_id=organization_id,
                    is_applicant=is_applicant,
                )
            )

            # ====================================================
            # STORE VERIFIED RESULT
            # ====================================================

            execution_history.append(
                {
                    "step": step + 1,
                    "tool": tool_name,
                    "arguments": arguments,
                    "result": tool_result,
                }
            )

        raise RuntimeError(
            "Agent reached maximum execution steps."
        )