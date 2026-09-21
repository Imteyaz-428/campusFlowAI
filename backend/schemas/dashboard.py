from pydantic import BaseModel


class DashboardOverviewResponse(BaseModel):
    students: int
    applications: int
    pending_documents: int
    pending_fees: int
    open_tickets: int
    escalated_tickets: int
    agent_actions_today: int