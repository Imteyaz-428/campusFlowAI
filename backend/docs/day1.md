# CampusFlow AI — Development Progress Notes

> **Project:** CampusFlow AI  
> **Problem Statement:** Agentic AI-Based System to Automate Campus Processes  
> **Team:** GuardianX Labs  
> **Current Focus:** Backend → Student Onboarding → Agent Tool Layer

---

## 1. Project Objective

CampusFlow AI is an **Agentic AI-powered campus process automation platform**.

The goal is not to build only a chatbot. The system should:

```text
Understand
    ↓
Retrieve trusted information
    ↓
Decide what action is required
    ↓
Use the appropriate campus tool/API
    ↓
Verify the result
    ↓
Respond to the student
    ↓
Escalate to a human when necessary
```

The platform is being built around the official problem statement:

> **Agentic AI-Based System to Automate Campus Processes**

Expected capabilities:

- AI-based virtual campus assistant
- Automated student onboarding
- Admission and query handling
- Academic/administrative workflow automation
- Centralized campus management dashboard

---

# 2. Critical Architecture Decision

The existing deployed RAG platform must remain **unchanged**.

CampusFlow AI is a separate project/repository that reuses the RAG architecture conceptually and will eventually expose RAG as an agent tool.

### Existing RAG = Knowledge Layer

```text
Campus Policies
Admission Rules
Fee Rules
Academic Information
Documents
        ↓
      RAG
        ↓
Grounded Institutional Knowledge
```

### CampusFlow = Knowledge + Action + Orchestration

```text
Student
   ↓
Agent Orchestrator
   ↓
RAG / Campus Tools / Action Tools
   ↓
Campus Database
   ↓
Verification
   ↓
Response / Human Escalation
```

---

# 3. Current Backend Stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Docker
- Pydantic
- Uvicorn

The existing RAG foundation can later provide institutional knowledge and LLM functionality.

---

# 4. Current Campus Modules

Current campus-specific backend modules include:

```text
Student
Admission
Onboarding
```

The main development focus has been **Student Onboarding**.

---

# 5. Student Onboarding System

The onboarding system tracks tasks that a student must complete.

Current default tasks:

| Task Key | Title | Required |
|---|---|---|
| `document_verification` | Document Verification | Yes |
| `academic_registration` | Academic Registration | Yes |
| `fee_payment` | Fee Payment | Yes |
| `library_registration` | Library Registration | Yes |
| `id_card_registration` | ID Card Registration | Yes |

Each task contains:

- student ID
- task key
- title
- description
- required flag
- status
- due date
- completion timestamp
- creation/update timestamps

---

# 6. Onboarding Task States

Valid statuses:

```text
pending
in_progress
completed
```

When a task becomes `completed`, the backend records:

```text
completed_at
```

When it is moved back to another state, `completed_at` is cleared.

---

# 7. Database Structure

Table:

```text
onboarding_tasks
```

Columns:

```text
id
student_id
task_key
title
description
required
status
due_date
completed_at
created_at
updated_at
```

Relationship:

```text
students
   │
   │ 1
   │
   │ many
   ▼
onboarding_tasks
```

Foreign key:

```text
onboarding_tasks.student_id
        ↓
students.id
```

Delete behavior:

```text
ON DELETE CASCADE
```

Unique constraint:

```text
(student_id, task_key)
```

This prevents duplicate onboarding tasks for the same student.

---

# 8. Onboarding CRUD Layer

File:

```text
crud/onboarding.py
```

Current functions:

```python
create_onboarding_task()
get_student_onboarding()
get_onboarding_task()
update_onboarding_task()
get_onboarding_summary()
initialize_student_onboarding()
```

### Responsibilities

### `create_onboarding_task()`

- Verifies student exists
- Validates task status
- Prevents duplicate task keys
- Creates the task
- Sets completion timestamp when needed

### `get_student_onboarding()`

Returns all onboarding tasks for a student.

### `get_onboarding_task()`

Returns one onboarding task by ID.

### `update_onboarding_task()`

Updates:

- title
- description
- required flag
- status
- due date

Also manages:

```text
completed_at
```

### `get_onboarding_summary()`

Calculates:

```text
total_tasks
completed_tasks
pending_tasks
in_progress_tasks
progress_percentage
onboarding_status
```

### `initialize_student_onboarding()`

Creates the default onboarding workflow for a student.

It skips tasks that already exist, so it is safe to call repeatedly.

---

# 9. Onboarding Summary

Example successful response:

```json
{
  "student_id": 1,
  "total_tasks": 5,
  "completed_tasks": 2,
  "pending_tasks": 3,
  "in_progress_tasks": 0,
  "progress_percentage": 40,
  "onboarding_status": "in_progress"
}
```

Status logic:

```text
No tasks
   ↓
not_started

All tasks completed
   ↓
completed

Any completed/in-progress task
   ↓
in_progress

Otherwise
   ↓
pending
```

---

# 10. Onboarding API Endpoints

Router:

```text
router/campus_onboarding.py
```

Prefix:

```text
/campus/onboarding
```

Current endpoints:

```http
POST /campus/onboarding/
GET  /campus/onboarding/student/{student_id}
GET  /campus/onboarding/student/{student_id}/summary
GET  /campus/onboarding/{task_id}
PUT  /campus/onboarding/{task_id}
POST /campus/onboarding/student/{student_id}/initialize
GET  /campus/onboarding/student/{student_id}/next-action
POST /campus/onboarding/{task_id}/complete
```

---

# 11. Onboarding Initialization Test

The initialization endpoint was successfully tested.

Example:

```json
{
  "student_id": 1,
  "tasks_created": 3,
  "tasks_skipped": 2,
  "message": "Student onboarding initialized successfully."
}
```

After initialization, the student can have the complete five-task workflow.

---

# 12. Next Action Test

The backend successfully determines the student's next onboarding action.

Example:

```json
{
  "student_id": 1,
  "has_next_action": true,
  "next_action": {
    "task_id": 3,
    "task_key": "document_verification",
    "title": "Document Verification",
    "description": "Verify all required admission documents.",
    "status": "pending"
  },
  "message": "Next action: Document Verification"
}
```

This is important because the future agent can call the backend instead of guessing what the student should do next.

---

# 13. Task Completion Test

Task completion has also been tested successfully.

Example:

```json
{
  "id": 2,
  "student_id": 1,
  "task_key": "library_registration",
  "title": "Library Registration",
  "description": "Complete library registration.",
  "required": true,
  "status": "completed",
  "due_date": null,
  "completed_at": "2026-09-12T14:56:04.597069"
}
```

The onboarding summary then updates automatically.

Example:

```json
{
  "student_id": 1,
  "total_tasks": 5,
  "completed_tasks": 2,
  "pending_tasks": 3,
  "in_progress_tasks": 0,
  "progress_percentage": 40,
  "onboarding_status": "in_progress"
}
```

---

# 14. Important Database Issues Fixed

During development, the SQLAlchemy model and PostgreSQL table became temporarily inconsistent.

The Python model expected fields such as:

```text
task_name
```

while PostgreSQL used:

```text
task_key
title
required
```

This caused:

```text
column onboarding_tasks.task_name does not exist
```

The model, schema, and CRUD implementation were aligned with the actual database.

The current onboarding structure is:

```text
task_key
title
description
required
status
due_date
completed_at
created_at
updated_at
```

---

# 15. SQLAlchemy Relationship Issue Fixed

Another issue occurred between:

```text
Student
Admission
```

The error was:

```text
Mapper 'Mapper[Admission(admissions)]' has no property 'student'
```

This was caused by a mismatch in SQLAlchemy relationship / `back_populates` configuration.

The relationship configuration was corrected and the application now starts successfully.

---

# 16. Service Layer

File:

```text
services/campus/onboarding_service.py
```

Current service functions:

```python
create_onboarding_task_service()
get_student_onboarding_service()
get_onboarding_task_service()
update_onboarding_task_service()
get_onboarding_summary_service()
initialize_student_onboarding_service()
get_next_onboarding_action_service()
complete_onboarding_task_service()
```

Architecture:

```text
Router
  ↓
Service
  ↓
CRUD
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

The service layer keeps the router thin and delegates database/business logic to the CRUD layer.

---

# 17. Agent Tool Layer

This is the first major step toward making CampusFlow genuinely agentic.

Directory:

```text
services/agent/
```

Onboarding tools:

```text
services/agent/tools/onboarding_tools.py
```

These tools wrap the existing onboarding service functionality.

The future AI agent will use these tools instead of directly accessing the database.

---

# 18. Current Registered Agent Tools

The tool registry was successfully tested **inside Docker**.

Current registered tools:

```text
get_onboarding_tasks
get_onboarding_summary
get_next_onboarding_action
complete_onboarding_task
```

Successful test output:

```text
[
    'get_onboarding_tasks',
    'get_onboarding_summary',
    'get_next_onboarding_action',
    'complete_onboarding_task'
]
```

This confirms the onboarding tool layer and tool registry are working.

---

# 19. Tool Metadata / Schemas

File:

```text
services/agent/tool_schemas.py
```

Tool schemas were successfully created and tested.

Each schema contains:

```text
name
description
parameters
action_type
```

Example:

```json
{
  "name": "get_onboarding_summary",
  "description": "Get the student's onboarding progress including total tasks, completed tasks, pending tasks, progress percentage, and overall onboarding status.",
  "parameters": {
    "type": "object",
    "properties": {
      "student_id": {
        "type": "integer",
        "description": "The student's database ID."
      }
    },
    "required": [
      "student_id"
    ]
  },
  "action_type": "read"
}
```

---

# 20. Read vs Write Tool Concept

Tool metadata now distinguishes between read and write operations.

### Read Tools

```text
get_onboarding_tasks
get_onboarding_summary
get_next_onboarding_action
```

These retrieve information.

### Write Tool

```text
complete_onboarding_task
```

This changes campus data.

This distinction will later support security and agent guardrails.

Concept:

```text
READ
 ↓
Can generally execute automatically

WRITE
 ↓
Authorization
 ↓
Business-rule validation
 ↓
Potential confirmation / human approval
```

This becomes especially important for future sensitive operations such as:

- fee payments
- refunds
- document verification decisions
- admission decisions
- administrative changes

---

# 21. Current Agent Architecture

Current foundation:

```text
                    Student
                       │
                       ▼
                 Agent Interface
                       │
                       ▼
              Agent Orchestrator
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        RAG Knowledge      Tool Registry
              │                 │
              │        ┌────────┼────────┐
              │        ▼        ▼        ▼
              │      Tasks    Summary   Next Action
              │                           │
              │                           ▼
              │                    Complete Task
              │
              ▼
       Institutional Policies
              │
              └──────────────┐
                             ▼
                         Response
```

Final architecture will additionally contain:

```text
Verification
Human Approval
Audit Logging
```

---

# 22. Why CampusFlow Is Agentic

A normal chatbot:

```text
User
 ↓
LLM
 ↓
Answer
```

CampusFlow:

```text
User
 ↓
Agent
 ↓
Understand request
 ↓
Select tool
 ↓
Execute tool
 ↓
Observe result
 ↓
Decide next step
 ↓
Verify
 ↓
Respond
```

Example:

### User

> What is my onboarding progress?

Agent:

```text
Understand intent
        ↓
Need onboarding progress
        ↓
Call get_onboarding_summary(student_id=1)
        ↓
Receive actual database result
        ↓
Generate response
```

Another example:

### User

> What should I complete next?

Agent:

```text
Understand intent
        ↓
Need next onboarding action
        ↓
Call get_next_onboarding_action(student_id=1)
        ↓
Receive Document Verification
        ↓
Explain next action
```

The important point is:

> **The LLM does not invent campus state. It uses tools to retrieve the actual state from the campus system.**

---

# 23. Current Development Status

## Completed

- [x] Campus backend structure
- [x] Student module
- [x] Admission module
- [x] Onboarding database table
- [x] Onboarding SQLAlchemy model
- [x] Onboarding Pydantic schemas
- [x] Onboarding CRUD
- [x] Onboarding service layer
- [x] Onboarding API router
- [x] Onboarding initialization
- [x] Onboarding summary
- [x] Next-action logic
- [x] Task completion logic
- [x] Onboarding agent tools
- [x] Tool registry
- [x] Tool metadata schemas
- [x] Docker backend testing

## Currently Working

- [ ] Agent orchestrator
- [ ] LLM tool selection
- [ ] Tool execution loop
- [ ] Agent state/context
- [ ] RAG as an agent tool
- [ ] Agent response generation
- [ ] Authorization / guardrails
- [ ] Audit logs
- [ ] Human-in-the-loop workflow

---

# 24. Next Development Step — Agent Orchestrator

Next major file:

```text
services/agent/orchestrator.py
```

Responsibilities:

```text
User Message
     ↓
Agent Orchestrator
     ↓
Understand request
     ↓
Choose tool
     ↓
Validate arguments
     ↓
Execute tool
     ↓
Receive result
     ↓
Give result to LLM
     ↓
Generate final answer
```

Example:

```text
User:
"What is my onboarding progress?"
             ↓
        Agent
             ↓
get_onboarding_summary
             ↓
PostgreSQL
             ↓
40% completed
             ↓
Agent
             ↓
"You have completed 2 of 5 onboarding tasks."
```

---

# 25. Planned Campus Tool Categories

### Student

```text
get_student_profile()
```

### Admissions

```text
get_admission_status()
get_required_documents()
```

### Documents

```text
verify_documents()
get_missing_documents()
```

### Fees

```text
get_fee_status()
```

### Complaints

```text
create_ticket()
get_ticket_status()
```

### Institutional Knowledge

```text
search_institutional_policy()
```

These will eventually form a controlled campus tool ecosystem.

---

# 26. Preferred Agent Architecture

We should **not build dozens of separate agents**.

Preferred architecture:

```text
                    CAMPUS AGENT
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
       RAG          Campus Tools     Action Tools
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Admission      Onboarding        Fees
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    Verification
                         │
                         ▼
                  Human Escalation
```

One strong orchestrator + controlled tools is easier to:

- build
- test
- secure
- explain
- demonstrate

---

# 27. Target End-to-End Demo

A strong demo should demonstrate real agent behavior.

### Step 1 — Student asks

> What do I need to complete for onboarding?

Agent calls:

```text
get_onboarding_tasks()
```

### Step 2 — Student asks

> How much of my onboarding is complete?

Agent calls:

```text
get_onboarding_summary()
```

### Step 3 — Student asks

> What should I do next?

Agent calls:

```text
get_next_onboarding_action()
```

### Step 4 — Student completes an action

> I have completed library registration.

Agent calls:

```text
complete_onboarding_task()
```

### Step 5 — Agent verifies

Agent calls:

```text
get_onboarding_summary()
```

Then returns the updated progress.

This demonstrates:

```text
Understand
→ Tool Selection
→ Action
→ Verification
→ Response
```

---

# 28. Team Development Rules

Before changing code:

1. Pull the latest changes from GitHub.
2. Work only inside `campusFlowAI`.
3. Never modify the original deployed RAG project.
4. Test backend changes inside Docker.
5. Never commit `.env` secrets.
6. Do not commit `.venv`.
7. Do not commit `__pycache__`.
8. Do not commit logs/uploads unless intentionally required.
9. Keep working onboarding APIs stable.
10. Add AI/agent functionality on top of the existing campus APIs.

---

# 29. Current Milestone

CampusFlow has now moved beyond simple CRUD.

Current architecture:

```text
                    CAMPUSFLOW AI
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Campus APIs                    Agent Layer
          │                             │
          ▼                             ▼
     PostgreSQL                   Tool Registry
          │                             │
          ▼                             ▼
    Onboarding Data            Tool Metadata/Schemas
                                        │
                                        ▼
                              NEXT: ORCHESTRATOR
```

### Most important milestone reached

The backend can now expose real campus operations as **agent-callable tools**.

The next milestone is to connect these tools to an LLM through the **Agent Orchestrator** so CampusFlow can:

```text
Understand
   ↓
Select Tool
   ↓
Execute
   ↓
Observe Result
   ↓
Verify
   ↓
Respond
```

---

# 30. Next Immediate Task

**Do not start the frontend yet.**

Complete this sequence first:

```text
Tool Registry
      ↓
Tool Schemas
      ↓
Agent Orchestrator
      ↓
LLM Tool Selection
      ↓
Tool Execution
      ↓
Verification
      ↓
Agent Response
```

After the onboarding agent loop works end-to-end, move to:

```text
Document Verification
        ↓
Admission Agent
        ↓
Fee / Complaint Workflow
        ↓
RAG Integration
        ↓
Student UI
        ↓
Admin Dashboard
        ↓
Audit + Human Approval
```

---

# 31. Team Handoff Summary

### What is already working?

```text
PostgreSQL
     ↓
Campus APIs
     ↓
Onboarding CRUD
     ↓
Onboarding Services
     ↓
Onboarding Agent Tools
     ↓
Tool Registry
     ↓
Tool Schemas
```

### What are we building next?

```text
Tool Registry
     ↓
Agent Orchestrator
     ↓
LLM
     ↓
Tool Selection
     ↓
Tool Execution
     ↓
Verification
     ↓
Final Agent Response
```

### Important for teammates

Do **not** rewrite the onboarding module.

The onboarding backend is already functional and tested.

The next work should build the **agent layer on top of it**.

The objective is to transform:

```text
Campus APIs
```

into:

```text
Agentic Campus Automation
```

without breaking the existing working APIs.