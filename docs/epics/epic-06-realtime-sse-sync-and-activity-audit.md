# Epic 06: Silent Real-Time Sync & Live Audit Trail

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ DB Domain Services $\rightarrow$ [Hono API & Next.js Web UI]  

---

## Executive Summary
This epic delivers the real-time collaboration layer that links autonomous agent activity to human observability. When external agents call MCP tools, Hono broadcasts mutations over Server-Sent Events (SSE). The Next.js Kanban board applies silent, smooth CSS column transitions without disruptive notifications. Furthermore, an immutable activity audit timeline provides complete transparency into who proposed, claimed, submitted, and signed off on each ticket.

---

## Features

### FEAT-06-01: SSE Streaming Pipeline & Silent Card Transitions
- **ID:** `FEAT-06-01`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As a human engineering manager watching the Kanban board, I want ticket cards to smoothly transition columns in real time when agents claim or submit work, without needing to refresh the page.*
- **Scope & Description:**
  - Hono SSE endpoint: `GET /api/projects/:id/stream` using Hono's `streamSSE` utility.
  - Event broadcaster singleton in API layer emitting events on:
    - `ticket:created`: When an Epic/Feature/Bug is proposed or filed.
    - `ticket:updated`: When status transitions, claims, or criteria updates happen.
    - `activity:new`: Appended audit event.
  - Next.js React hook: `useProjectStream(projectId)` subscribing to the SSE stream.
  - Kanban board reacts to incoming events by silently updating local state with smooth CSS layout transitions.
- **Acceptance Criteria Checklist:**
  - [ ] SSE connection initiates upon project selection and maintains keep-alive ping.
  - [ ] Ticket state mutations in API immediately dispatch SSE event to active project subscribers.
  - [ ] Next.js board updates column state without full-page re-render or layout shifts.
  - [ ] Adheres strictly to Minimal Design System: no distracting blinking dots or noisy toast spam.
- **Manual Verification via UI (UAT):**
  1. Open the Web UI Kanban board in browser window A.
  2. In a terminal or MCP client, invoke `claim_task` on a ticket in the **Approved** column.
  3. Observe window A without touching mouse or keyboard: verify the card slides smoothly from **Approved** into **In Progress** column within 500ms.
  4. Invoke `submit_for_review`: verify card moves smoothly into **Ready for Test**.

---

### FEAT-06-02: Chronological Activity Audit Timeline
- **ID:** `FEAT-06-02`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As an auditor or team lead, I want to inspect a complete chronological audit log of all human and agent actions in the ticket detail modal, so that every decision and hand-off is fully transparent.*
- **Scope & Description:**
  - Database schema: `activity_logs` table (`id`, `projectId`, `entityType`, `entityId`, `action`, `actorType`, `actorId`, `details`, `createdAt`).
  - Hono API endpoints:
    - `GET /api/projects/:id/activity` (project-wide audit trail)
    - `GET /api/tickets/:type/:id/activity` (ticket-specific audit timeline)
  - Web UI: Ticket Detail modal "Activity Timeline" component displaying chronological events with distinct `HUMAN` vs `AGENT` pill badges, timestamps, and notes.
- **Acceptance Criteria Checklist:**
  - [ ] All state mutations write an immutable record to `activity_logs`.
  - [ ] API endpoint returns chronologically sorted logs for the entity.
  - [ ] Detail modal renders timeline with clear typography and minimal divider styling.
  - [ ] Distinguishes clearly between agent actions (`CLAIMED`, `SUBMITTED`) and human actions (`APPROVED`, `CLOSED`).
- **Manual Verification via UI (UAT):**
  1. Open the Ticket Detail modal for any card that has transitioned through states.
  2. Scroll to the "Activity Timeline" section in the modal.
  3. Verify entries appear in order: Propose $\rightarrow$ Approve $\rightarrow$ Claim $\rightarrow$ Submit.
  4. Verify each entry shows the actor badge (`AGENT` in indigo, `HUMAN` in neutral), timestamp, and any attached notes.

---

### FEAT-06-03: Connection Health & Auto-Reconnection
- **ID:** `FEAT-06-03`
- **Priority:** `MEDIUM`
- **Status:** `TODO`
- **User Story:**  
  *As a human user, I want the web interface to automatically and gracefully reconnect to the SSE stream if the network drops or server restarts, so that my view is never silently stale.*
- **Scope & Description:**
  - Client-side reconnection logic with exponential backoff in `useProjectStream`.
  - Subtle status indicator in top-nav (e.g., quiet subtle dot: green for connected, muted gray with retry indicator when reconnecting).
  - Fetches fresh board snapshot upon successful reconnection to ensure no missed events.
- **Acceptance Criteria Checklist:**
  - [ ] Hook detects connection drop and retries automatically.
  - [ ] Triggers a fresh query of `/api/projects/:id/features` upon reconnection to sync any dropped events.
  - [ ] Reconnection status is discrete and does not disrupt user interactions.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000`.
  2. Kill and restart the API server in terminal.
  3. Observe top-nav connection status changes to reconnecting, then back to connected.
  4. Verify the Kanban board re-syncs state without requiring manual browser page reload.
