from typing import Any, Dict, List



# TOOL SCHEMAS


TOOL_SCHEMAS: List[Dict[str, Any]] = [

    
    # INSTITUTIONAL KNOWLEDGE / RAG
    

    {
        "name": "search_institutional_knowledge",
        "description": (
            "Search the institution's official knowledge base "
            "and answer questions using relevant campus documents. "
            "Use this tool for admission rules, fees, policies, "
            "academic information, campus procedures, notices, "
            "and other institutional information."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "question": {
                    "type": "string",
                    "description": (
                        "The student's question about institutional "
                        "or campus information."
                    )
                }
            },
            "required": ["question"]
        }
    },

    
    # STUDENT PROFILE
    

    {
        "name": "get_student_profile",
        "description": (
            "Get the authenticated student's basic profile. "
            "Use this tool when the student asks for their "
            "application number, admission number, roll number, "
            "name, program, department, academic year, semester, "
            "or current student status."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
        
    # GET ADMISSION STATUS
    

    {
        "name": "get_admission_status",
        "description": (
            "Get the authenticated student's admission status. "
            "Use this tool when the student asks about their "
            "application status, admission status, eligibility, "
            "approval, rejection, admission confirmation, "
            "admission number, or roll number."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
        
    # REQUIRED DOCUMENTS
    

    {
        "name": "get_required_documents",
        "description": (
            "Get the configured admission document checklist. "
            "Use this when the student asks which documents are "
            "required for their admission or document verification. "
            "For institution-specific policy details, prefer the "
            "institutional knowledge tool."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # DOCUMENT STATUS
    

    {
        "name": "get_document_status",
        "description": (
            "Get the authenticated student's submitted document "
            "status, including verification status and missing "
            "required documents. Use this when the student asks "
            "which documents they submitted, which are missing, "
            "or whether their document submission is complete."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # DOCUMENT VERIFICATION STATUS
    

    {
        "name": "verify_documents",
        "description": (
            "Check the current verification state of the "
            "authenticated student's submitted documents. "
            "This is READ-ONLY and does not approve, reject, "
            "or modify any document. Use this when the student "
            "asks whether their documents have been verified."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # FEE STATUS
    

    {
        "name": "get_fee_status",
        "description": (
            "Get the authenticated student's fee status, including "
            "total amount, paid amount, pending amount, mandatory "
            "pending fees, due dates, and payment references. "
            "Use this when the student asks about fees, payment "
            "status, pending fees, or whether a mandatory fee is paid."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    
    
    
    # GET ONBOARDING TASKS
    

    {
        "name": "get_onboarding_tasks",
        "description": (
            "Get all onboarding tasks for the authenticated "
            "student, including their completion status."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # GET ONBOARDING SUMMARY
    

    {
        "name": "get_onboarding_summary",
        "description": (
            "Get a summary of the authenticated student's "
            "onboarding progress, including completed and "
            "pending tasks."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # GET NEXT ONBOARDING ACTION
    

    {
        "name": "get_next_onboarding_action",
        "description": (
            "Determine the next pending onboarding action "
            "for the authenticated student."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # GENERIC COMPLETE ONBOARDING TASK
    

    {
        "name": "complete_onboarding_task",
        "description": (
            "Complete a generic onboarding task for the "
            "authenticated student. Use specialized registration "
            "tools when the task is academic registration, "
            "library registration, or ID card registration."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": (
                        "The onboarding task ID obtained from "
                        "the student's onboarding tasks."
                    )
                }
            },
            "required": ["task_id"]
        }
    },

    
    # COMPLETE ACADEMIC REGISTRATION
    

    {
        "name": "complete_academic_registration",
        "description": (
            "Complete academic registration for the authenticated "
            "student. The student must have confirmed admission. "
            "This operation also generates the student's roll "
            "number."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # COMPLETE LIBRARY REGISTRATION
    

    {
        "name": "complete_library_registration",
        "description": (
            "Complete library registration for the authenticated "
            "student. The student must have confirmed admission."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },

    
    # COMPLETE ID CARD REGISTRATION
    

    {
        "name": "complete_id_card_registration",
        "description": (
            "Complete ID card registration for the authenticated "
            "student. The student must have confirmed admission."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "create_ticket",
        "description": (
            "Create a support ticket or complaint for the authenticated "
            "student when the student explicitly reports a campus issue "
            "that needs staff attention. Use this for issues such as "
            "fee discrepancies, document problems, admission problems, "
            "technical portal issues, or other campus service complaints."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": (
                        "Ticket category such as fee, admission, "
                        "document, technical, onboarding, or other."
                    ),
                },
                "subject": {
                    "type": "string",
                    "description": "Short title describing the issue.",
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the student's issue.",
                },
                "department": {
                    "type": "string",
                    "description": (
                        "Department responsible for the issue, such as "
                        "finance, admission, academic, IT, or administration."
                    ),
                },
                "priority": {
                    "type": "string",
                    "description": "Ticket priority: low, medium, high, or urgent.",
                    "enum": [
                        "low",
                        "medium",
                        "high",
                        "urgent",
                    ],
                },
            },
            "required": [
                "category",
                "subject",
                "description",
                "department",
                "priority",
            ],
        },
        "action_type": "write",
    },
    
    {
        "name": "get_my_tickets",
        "description": (
            "Get all support tickets and complaints belonging to "
            "the authenticated student."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
        },
        "action_type": "read",
    },
    {
    "name": "get_ticket_status",
    "description": (
        "Get the current status, department, priority, resolution, "
        "and other details of one ticket belonging to the authenticated student."
    ),
        "parameters": {
            "type": "object",
            "properties": {
                "ticket_number": {
                    "type": "string",
                    "description": (
                        "The ticket number, for example TKT-2026-00001."
                    ),
                },
            },
            "required": [
                "ticket_number",
            ],
        },
        "action_type": "read",
    },
]



# SCHEMA HELPERS


def get_tool_schemas() -> List[Dict[str, Any]]:
    """
    Return all registered tool schemas.
    """

    return TOOL_SCHEMAS


def get_tool_schema(tool_name: str):
    """
    Return a single tool schema by name.
    """

    for schema in TOOL_SCHEMAS:
        if schema["name"] == tool_name:
            return schema

    return None