from services.agent.tools.onboarding_tools import (
    get_onboarding_tasks_tool,
    get_onboarding_summary_tool,
    get_next_onboarding_action_tool,
    complete_onboarding_task_tool,
    complete_academic_registration_tool,
    complete_library_registration_tool,
    complete_id_card_registration_tool,
)
from services.agent.tools.document_tools import (
    get_required_documents_tool,
    get_document_status_tool,
    verify_documents_tool,
)

from services.agent.tools.fee_tools import (
    get_fee_status_tool,
)

from services.agent.tools.student_tools import (
    get_student_profile_tool,
    get_admission_status_tool,
)

from services.agent.tools.rag_tools import (
    search_institutional_knowledge,
)
from services.agent.tools.ticket_tools import (
    create_ticket_tool,
    get_my_tickets_tool,
    get_ticket_status_tool,
)



# ONBOARDING TOOLS


ONBOARDING_TOOLS = {
    "get_onboarding_tasks":
        get_onboarding_tasks_tool,

    "get_onboarding_summary":
        get_onboarding_summary_tool,

    "get_next_onboarding_action":
        get_next_onboarding_action_tool,

    "complete_onboarding_task":
        complete_onboarding_task_tool,

    "complete_academic_registration":
        complete_academic_registration_tool,

    "complete_library_registration":
        complete_library_registration_tool,

    "complete_id_card_registration":
        complete_id_card_registration_tool,
}



# STUDENT TOOLS


STUDENT_TOOLS = {
    "get_student_profile":
        get_student_profile_tool,

    "get_admission_status":
        get_admission_status_tool,
}



# RAG TOOLS


RAG_TOOLS = {
    "search_institutional_knowledge":
        search_institutional_knowledge,
}

# DOCUMENT TOOLS


DOCUMENT_TOOLS = {
    "get_required_documents":
        get_required_documents_tool,

    "get_document_status":
        get_document_status_tool,

    "verify_documents":
        verify_documents_tool,
}



# FEE TOOLS


FEE_TOOLS = {
    "get_fee_status":
        get_fee_status_tool,
}
TICKET_TOOLS = {
    "create_ticket": create_ticket_tool,
    "get_my_tickets": get_my_tickets_tool,
    "get_ticket_status": get_ticket_status_tool,
}


# ALL AGENT TOOLS


AGENT_TOOLS = {
    **ONBOARDING_TOOLS,
    **STUDENT_TOOLS,
    **DOCUMENT_TOOLS,
    **FEE_TOOLS,
    **RAG_TOOLS,
    **TICKET_TOOLS,
}





# TOOL LOOKUP


def get_tool(tool_name: str):
    """
    Return a registered agent tool by name.
    """

    return AGENT_TOOLS.get(tool_name)



# TOOL LIST


def list_tools():
    """
    Return the names of all registered agent tools.
    """

    return list(AGENT_TOOLS.keys())
