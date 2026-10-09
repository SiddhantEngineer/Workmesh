# Epic 05: Defect Tracking & Bug Lifecycle

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ Hono API $\rightarrow$ MCP Server $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic provides a bidirectional defect tracking system. Both humans (during QA) and autonomous AI agents (upon encountering failing tests or runtime exceptions) can file bugs linked to specific features or epics. Agents can query open bugs as actionable tasks, claim them, and call `resolve_bug`, while humans verify the fixes in the UI.

---

## Features

### FEAT-05-01: Bidirectional Bug Reporting Flow
- **ID:** `FEAT-05-01`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI agent encountering a blocker or a human discovering a QA defect, I want to file a Bug ticket optionally linked to a Feature, so that the team can track and prioritize fixes.*
- **Scope & Description:**
  - Database schema: `bugs` table with `id`, `key` (e.g. `WM-B1`), `title`, `description`, `reproductionSteps`, `priority`, `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `featureId`, `epicId`.
  - Shared Zod validation schema for bug reporting.
  - Hono API endpoints: `POST /api/bugs` and `GET /api/bugs`.
  - MCP Tool: `report_bug` taking `title`, `description`, `reproductionSteps`, `priority`, `featureId`, `epicId`.
  - Web UI: "+ File Bug" button inside the Ticket Detail modal and standalone header button.
- **Acceptance Criteria Checklist:**
  - [ ] Bug schema auto-generates bug key with `B` prefix (e.g. `WM-B1`).
  - [ ] Can link bug to `featureId` or `epicId`.
  - [ ] Both Human and Agent can invoke creation.
  - [ ] Feature cards display linked bug count badge (e.g., `🐛 1 bug`).
  - [ ] Activity log records `BUG_REPORTED`.
- **Manual Verification via UI (UAT):**
  1. Open the Ticket Detail modal for feature `WM-1`.
  2. In the "Linked Bugs" section, click "+ File Bug".
  3. Enter title "TypeError on null project ID", description, and reproduction steps.
  4. Submit modal: verify the bug is listed under "Linked Bugs" with status badge `OPEN`.
  5. Close modal: verify the Kanban card for `WM-1` now displays `🐛 1 bug` in its footer.

---

### FEAT-05-02: Bug Claiming & Resolution Flow
- **ID:** `FEAT-05-02`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent, I want to claim an open bug and call `resolve_bug` once the fix is verified, so that QA can confirm the resolution.*
- **Scope & Description:**
  - Hono API endpoints:
    - `PATCH /api/bugs/:id/claim` (transitions `OPEN` $\rightarrow$ `IN_PROGRESS`)
    - `PATCH /api/bugs/:id/resolve` (transitions `IN_PROGRESS` $\rightarrow$ `RESOLVED`, accepts fix notes)
    - `PATCH /api/bugs/:id/close` (Human sign-off: `RESOLVED` $\rightarrow$ `CLOSED`)
  - MCP Tool: `resolve_bug` taking `bugId` and optional `notes`.
  - Web UI: Bug list inside detail modal allows human to click [Close Bug] or re-open.
- **Acceptance Criteria Checklist:**
  - [ ] `list_actionable_tasks` includes `OPEN` bugs so agents can pick them up.
  - [ ] Agent can claim bug via `claim_task` with `ticketType: "BUG"`.
  - [ ] Agent calls `resolve_bug` via MCP, moving status to `RESOLVED`.
  - [ ] Web UI displays updated status badge `RESOLVED` and allows human to mark `CLOSED`.
- **Manual Verification via UI (UAT):**
  1. Open detail modal for a ticket with an open linked bug.
  2. Invoke `resolve_bug` via MCP with notes "Added null check and fallback".
  3. Refresh/observe UI: confirm the bug status badge transitions from `OPEN` to `RESOLVED`.
  4. Click [Close Bug] in UI: confirm status transitions to `CLOSED`.

---

### FEAT-05-03: Feature Closure Blocker Check
- **ID:** `FEAT-05-03`
- **Priority:** `MEDIUM`
- **Status:** `TODO`
- **User Story:**  
  *As a human engineering manager, I want the system to warn or prevent closing a Feature if it has unresolved open bugs, so that defective work is not marked done.*
- **Scope & Description:**
  - Validation check in `PATCH /api/features/:id/close` verifying no linked bugs have status `OPEN` or `IN_PROGRESS`.
  - Web UI: If open bugs exist on a feature, the [Verify & Close] button shows a warning tooltip and disables 1-click closure until bugs are resolved.
- **Acceptance Criteria Checklist:**
  - [ ] API rejects closure attempt if linked bugs are active (`OPEN`/`IN_PROGRESS`) with a 400 error.
  - [ ] Web UI modal visually disables [Verify & Close] and shows alert: "Cannot close feature with open bugs".
- **Manual Verification via UI (UAT):**
  1. Have a feature in **Ready for Test** with 1 open bug.
  2. Open the ticket detail modal: verify the [Verify & Close] button is disabled with an explanatory tooltip or alert.
  3. Resolve the linked bug.
  4. Verify the [Verify & Close] button becomes active immediately.
