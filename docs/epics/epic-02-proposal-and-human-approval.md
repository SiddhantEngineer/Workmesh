# Epic 02: Epic & Feature Proposal and Human Approval

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ DB Domain Services $\rightarrow$ [Hono API & MCP Server] $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic establishes the planning and guardrail workflow. Both AI agents and humans can propose Epics and actionable Features with acceptance criteria. All newly created tickets enter the `PROPOSED` state and strictly require human intervention (approval or rejection) via the Web UI before work can begin.

---

## Features

### FEAT-02-01: Epic Proposal & Breakdown Flow
- **ID:** `FEAT-02-01`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As an AI agent or human planner, I want to create an Epic with title, description, and priority, so that large milestones can be staged for engineering review.*
- **Scope & Description:**
  - Shared Zod schema for creating an Epic (`title`, `description`, `priority`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`).
  - Shared domain service `epicService.createEpic(...)` with atomic ticket numbering and `recordActivity`.
  - Hono API endpoints: `POST /api/projects/:key/epics` and `GET /api/projects/:key/epics`.
  - MCP Tool: `create_epic` accepting `projectId` / `projectKey`, `title`, `description`, `priority`.
  - Web UI: Epic badge rendering and filter selector above the Kanban board.
- **Acceptance Criteria Checklist:**
  - [ ] Shared Zod schema enforces non-empty title and valid priority enum.
  - [ ] API stores Epic with initial status `PROPOSED` and generates sequential key (e.g., `WM-1`).
  - [ ] MCP tool `create_epic` registers successfully and returns created Epic payload.
  - [ ] Activity log record created for Epic creation (`entityType: "EPIC"`, `action: "CREATED"`).
  - [ ] Web UI displays existing epics in an Epic filter pill bar.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000`.
  2. Invoke `create_epic` via MCP client with title "Auth Integration", priority "HIGH".
  3. Refresh/observe UI and verify "Auth Integration" appears in the Epic selector/filter.
  4. Verify the Epic is stored with `PROPOSED` status.

---

### FEAT-02-02: Feature Proposal with Acceptance Criteria Flow
- **ID:** `FEAT-02-02`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI agent or human, I want to propose a discrete Feature under an Epic with a checklist of acceptance criteria, so that work is well-scoped and verifiable.*
- **Scope & Description:**
  - Shared Zod schema for feature proposal (`epicId`, `title`, `description`, `priority`, `acceptanceCriteria: string[]`).
  - Hono API endpoints: `POST /api/epics/:id/features` and `GET /api/projects/:id/features`.
  - MCP Tool: `propose_feature` taking `epicId`, `title`, `description`, `priority`, `acceptanceCriteria`.
  - Web UI: "+ New Ticket" modal with dynamic criteria checklist input fields.
- **Acceptance Criteria Checklist:**
  - [ ] Feature schema validates at least one acceptance criteria item.
  - [ ] Feature receives formatted ticket key (e.g. `WM-1`) and initial status `PROPOSED`.
  - [ ] Acceptance criteria saved as structured JSON/array items in DB.
  - [ ] MCP tool `propose_feature` returns created feature ID and key.
  - [ ] "+ New Ticket" modal in Web UI allows humans to submit a proposed feature.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000`.
  2. Click the top-right "+ New Ticket" button.
  3. Fill out title "Implement Session Cookie", choose an Epic, set priority "MEDIUM", and add 2 acceptance criteria.
  4. Submit modal.
  5. Verify the new feature appears as a card in the **Proposed** column on the Kanban board with ticket key `WM-X` and criteria counter `✓ 0/2 criteria`.

---

### FEAT-02-03: Proposed Column & Human Approval / Rejection Flow
- **ID:** `FEAT-02-03`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As a human engineering manager, I want to review proposed tickets on the Kanban board and 1-click Approve or Reject them, so that agents only work on sanctioned tasks.*
- **Scope & Description:**
  - Hono API endpoints:
    - `PATCH /api/features/:id/approve` (transitions `PROPOSED` $\rightarrow$ `APPROVED`)
    - `PATCH /api/features/:id/reject` (transitions `PROPOSED` $\rightarrow$ `REJECTED`, accepts reason)
  - Web UI: "Proposed" column on Kanban board with direct action buttons on cards or inside the Ticket Detail modal.
  - Enforce Human-Only rule: Agents cannot execute these approval transitions.
- **Acceptance Criteria Checklist:**
  - [x] Non-human transition attempts are blocked at the API layer.
  - [x] Card in Proposed column displays [Approve] and [Reject] action triggers.
  - [x] Clicking [Approve] transitions status to `APPROVED` and moves card into the **Approved** column.
  - [x] Clicking [Reject] opens prompt for reason, sets status to `REJECTED`, and archives/moves card.
  - [x] Activity log records approval/rejection with timestamp and actor type `HUMAN`.
- **Manual Verification via UI (UAT):**
  1. Locate a card in the **Proposed** column.
  2. Click the [Approve] button directly on the card (or inside its detail modal).
  3. Verify the card immediately leaves **Proposed** and appears in the **Approved** column.
  4. Propose another test ticket, click [Reject], enter rejection reason "Out of MVP scope".
  5. Confirm the card is marked rejected and no longer appears as actionable.
