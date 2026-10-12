# Epic 05: Defect Tracking & Bug Lifecycle

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ DB Domain Services $\rightarrow$ [Hono API & MCP Server] $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic provides a bidirectional defect tracking system with dedicated route pages for bug inspection. Both humans (during QA) and autonomous AI agents (upon encountering failing tests or runtime exceptions) can file bugs linked to specific features or epics. Agents can query open bugs as actionable tasks, claim them, and call `resolve_bug`, while humans inspect bug details at `/projects/[key]/bugs/[bugKey]` and verify fixes.

---

## Features

### FEAT-05-01: Bidirectional Bug Reporting & Linked Bugs Flow
- **ID:** `FEAT-05-01`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI agent encountering a blocker or a human discovering a QA defect, I want to file a Bug ticket linked to a Feature, and view it at `/projects/[key]/bugs/[bugKey]`, so that defects have deep-linkable URLs with reproduction steps.*
- **Scope & Description:**
  - Database schema: `bugs` table with `id`, `key` (e.g. `WM-B1`), `title`, `description`, `reproductionSteps`, `priority`, `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `featureId`, `epicId`.
  - Shared Zod validation schema for bug reporting.
  - Hono API endpoints: `POST /api/bugs` and `GET /api/bugs`.
  - MCP Tool: `report_bug` taking `title`, `description`, `reproductionSteps`, `priority`, `featureId`, `epicId`.
  - Web UI:
    - "+ File Bug" modal triggered from Feature Detail page or Project Hub.
    - Linked bugs section in `/projects/[key]/features/[featureKey]` showing bug badges and direct links.
    - Kanban cards display linked bug count badge (e.g., `🐛 1 bug`).
- **Acceptance Criteria Checklist:**
  - [ ] Bug schema auto-generates bug key with `B` prefix (e.g. `WM-B1`).
  - [ ] Can link bug to `featureId` or `epicId`.
  - [ ] Both Human and Agent can invoke creation.
  - [ ] Feature Detail page lists linked bugs with links to `/projects/[key]/bugs/[bugKey]`.
  - [ ] Activity log records `BUG_REPORTED`.
- **Manual Verification via UI (UAT):**
  1. Open the Feature Detail page at `/projects/WM/features/WM-1`.
  2. In the "Linked Bugs" section, click "+ File Bug".
  3. Enter title "TypeError on null project ID", description, and reproduction steps in the quick modal.
  4. Submit modal: verify the bug appears in the "Linked Bugs" list with status badge `OPEN` and ticket key `WM-B1`.
  5. Click on `WM-B1`: verify browser navigates to `/projects/WM/bugs/WM-B1`.

---

### FEAT-05-02: Dedicated Bug Detail Page & Resolution Flow
- **ID:** `FEAT-05-02`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As an engineer or agent, I want a dedicated Bug Detail page at `/projects/[key]/bugs/[bugKey]`, so that I can inspect reproduction steps, claim the bug, resolve it, or verify and close it.*
- **Scope & Description:**
  - Route: `/projects/[key]/bugs/[bugKey]`.
  - Breadcrumbs: `Projects / [Project Name] / Bugs / [Bug Key]` (with backlink to parent feature).
  - Main View: Defect title, priority, status badge, full description, formatted reproduction steps, and resolution notes.
  - Action Bar: [Claim Bug], [Resolve Bug], [Close Bug].
  - Hono API endpoints:
    - `PATCH /api/bugs/:id/claim` (transitions `OPEN` $\rightarrow$ `IN_PROGRESS`)
    - `PATCH /api/bugs/:id/resolve` (transitions `IN_PROGRESS` $\rightarrow$ `RESOLVED`, accepts fix notes)
    - `PATCH /api/bugs/:id/close` (Human sign-off: `RESOLVED` $\rightarrow$ `CLOSED`)
  - MCP Tool: `resolve_bug` taking `bugId` and optional `notes`.
- **Acceptance Criteria Checklist:**
  - [ ] Direct URL `/projects/[key]/bugs/[bugKey]` loads bug details with parent feature link.
  - [ ] `list_actionable_tasks` includes `OPEN` bugs for agents.
  - [ ] Agent can claim bug via `claim_task` with `ticketType: "BUG"`.
  - [ ] Agent calls `resolve_bug` via MCP, moving status to `RESOLVED` and saving fix notes.
  - [ ] Web UI displays updated status badge `RESOLVED` and allows human to click [Close Bug].
- **Manual Verification via UI (UAT):**
  1. Navigate to `/projects/WM/bugs/WM-B1`.
  2. Verify reproduction steps and parent feature backlink are displayed.
  3. Invoke `resolve_bug` via MCP with notes "Added null check and fallback".
  4. Refresh/observe UI: confirm the bug status badge transitions from `OPEN` to `RESOLVED` and fix notes appear.
  5. Click [Close Bug] in UI: confirm status transitions to `CLOSED`.

---

### FEAT-05-03: Feature Closure Blocker Check
- **ID:** `FEAT-05-03`
- **Priority:** `MEDIUM`
- **Status:** `TODO`
- **User Story:**  
  *As a human engineering manager, I want the system to warn or prevent closing a Feature if it has unresolved open bugs, so that defective work is not marked done.*
- **Scope & Description:**
  - Validation check in `PATCH /api/features/:id/close` verifying no linked bugs have status `OPEN` or `IN_PROGRESS`.
  - Web UI: In `/projects/[key]/features/[featureKey]`, if open bugs exist on the feature, the [Verify & Close] button in the action rail is disabled with an alert badge.
- **Acceptance Criteria Checklist:**
  - [ ] API rejects closure attempt if linked bugs are active (`OPEN`/`IN_PROGRESS`) with a 400 error.
  - [ ] Feature Detail page visually disables [Verify & Close] and displays warning: "Cannot close feature with open bugs".
- **Manual Verification via UI (UAT):**
  1. Navigate to a feature in `READY_FOR_TEST` with 1 open bug (`/projects/WM/features/WM-1`).
  2. Verify the [Verify & Close] button in the right action rail is disabled with an explanatory tooltip or alert.
  3. Navigate to the linked bug and close/resolve it.
  4. Return to `/projects/WM/features/WM-1`: verify the [Verify & Close] button becomes active immediately.
