# Epic 03: Task Discovery & Agent Claiming

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ Hono API $\rightarrow$ MCP Server $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic enables the autonomous hand-off from human approval to agent execution. AI agents query ready-to-work tickets using `list_actionable_tasks` and explicitly claim them via `claim_task`. The Web UI displays the approved backlog and dynamically shifts claimed tasks into the **In Progress** column, allowing humans to inspect active tickets via a centered detail modal.

---

## Features

### FEAT-03-01: Actionable Task Discovery Flow
- **ID:** `FEAT-03-01`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent, I want to query all actionable tasks ready for execution, so that I can automatically select the highest-priority approved feature or open bug to work on.*
- **Scope & Description:**
  - Hono API endpoint: `GET /api/projects/:id/actionable-tasks` returning `APPROVED` features and `OPEN` bugs.
  - MCP Tool: `list_actionable_tasks` supporting optional filters for `status` (default `APPROVED`) and `epicId`.
  - Format output clearly with ticket keys, priorities, criteria summaries, and descriptions.
  - Web UI: **Approved** column populated with ready-to-claim cards.
- **Acceptance Criteria Checklist:**
  - [ ] API endpoint returns list sorted by priority (`CRITICAL` $\rightarrow$ `HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`).
  - [ ] Only `APPROVED` features and `OPEN` bugs are returned by default.
  - [ ] MCP tool `list_actionable_tasks` formats output for LLM readability.
  - [ ] Web UI displays accurate card count in the **Approved** column header.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000`.
  2. Ensure at least one feature is in the **Approved** column.
  3. Call `list_actionable_tasks` through the MCP client.
  4. Verify the returned task list matches the cards displayed in the UI's **Approved** column.

---

### FEAT-03-02: Task Claiming Flow
- **ID:** `FEAT-03-02`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent, I want to call `claim_task` on an approved ticket, so that the team knows I am actively developing it and no other agent duplicates the work.*
- **Scope & Description:**
  - Hono API endpoint: `PATCH /api/tasks/:id/claim` accepting `{ ticketType: "FEATURE" | "BUG", agentId?: string }`.
  - State machine transition: Moves ticket from `APPROVED` to `IN_PROGRESS`.
  - Record audit log entry (`action: "CLAIMED"`, `actor: "AGENT"`).
  - MCP Tool: `claim_task` executing this transition.
  - Web UI: Moves card from **Approved** column into **In Progress** column.
- **Acceptance Criteria Checklist:**
  - [ ] Prevents claiming tasks that are not in `APPROVED` status.
  - [ ] Updates status to `IN_PROGRESS` atomically in DB.
  - [ ] Appends `CLAIMED` record to `activity_logs`.
  - [ ] Web UI reflects card in **In Progress** column with amber priority pip and active styling.
- **Manual Verification via UI (UAT):**
  1. View a card `WM-1` in the **Approved** column of the Kanban board.
  2. Invoke `claim_task` via MCP with ticket ID and type.
  3. Refresh/observe UI: verify `WM-1` has shifted to the **In Progress** column.
  4. Open the detail modal for `WM-1` and verify the status badge reads "In Progress".

---

### FEAT-03-03: Centered Ticket Detail Modal & Criteria Management
- **ID:** `FEAT-03-03`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As a human user or reviewer, I want to click any Kanban card to open a focused 640px modal dialog, so that I can view ticket details, toggle acceptance criteria, and inspect active progress.*
- **Scope & Description:**
  - Centered Modal Dialog (max-width 640px with backdrop dim, adhering to Minimal Design System).
  - Displays ticket key in `Inconsolata` monospace, priority pip, and status badge.
  - Interactive Acceptance Criteria checklist allowing humans or agents to toggle checklist state.
  - API endpoint: `PATCH /api/features/:id/criteria` to persist criteria progress.
- **Acceptance Criteria Checklist:**
  - [ ] Clicking any card on the Kanban board opens the centered modal with backdrop blur/dim.
  - [ ] Modal header includes ticket key (`WM-X`), status, and priority dot.
  - [ ] Acceptance criteria items render with clean checkbox inputs.
  - [ ] Checking/unchecking an item persists immediately and updates card counter (e.g., `✓ 1/3`).
  - [ ] Modal dismissible via backdrop click, Escape key, or close button.
- **Manual Verification via UI (UAT):**
  1. Click on any card in the **In Progress** column.
  2. Confirm the centered 640px modal opens with dim backdrop.
  3. Check one of the acceptance criteria items.
  4. Close modal and check the card on the Kanban board: verify footer counter updates to `✓ 1/X criteria`.
  5. Re-open modal and verify the checked item remains checked.
