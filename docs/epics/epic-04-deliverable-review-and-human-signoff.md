# Epic 04: Deliverable Review & Human Sign-Off

**Status:** TODO  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ Hono API $\rightarrow$ MCP Server $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic handles the completion and verification milestone of the lifecycle. When an AI agent finishes implementing a feature, it marks all acceptance criteria as fulfilled and calls `submit_for_review`. The feature transitions to `READY_FOR_TEST`. A human engineering manager reviews the deliverables via the UI, runs verification, and executes the final sign-off to move the ticket to `CLOSED` (or sends it back for rework).

---

## Features

### FEAT-04-01: Agent Submission & Ready for Test Flow
- **ID:** `FEAT-04-01`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent, I want to call `submit_for_review` with completed checklist indices and implementation notes, so that my work transitions to `READY_FOR_TEST` for human verification.*
- **Scope & Description:**
  - Hono API endpoint: `POST /api/features/:id/submit` accepting `{ completedCriteria: boolean[] | number[], notes?: string }`.
  - State machine transition: Moves ticket from `IN_PROGRESS` $\rightarrow$ `READY_FOR_TEST`.
  - Appends audit entry (`action: "SUBMITTED_FOR_REVIEW"`, `actor: "AGENT"`, `details: { notes }`).
  - MCP Tool: `submit_for_review` taking `featureId`, `completedCriteria`, and optional `notes`.
  - Web UI: Moves card from **In Progress** to **Ready for Test** column with high-contrast review badge.
- **Acceptance Criteria Checklist:**
  - [ ] Transitions only allowed from `IN_PROGRESS` state.
  - [ ] Marks all specified criteria as completed in the database.
  - [ ] Stores agent notes in activity log.
  - [ ] MCP tool returns confirmation message with review status.
  - [ ] Web UI displays card in **Ready for Test** column with prominent call-to-action state.
- **Manual Verification via UI (UAT):**
  1. Have an active card in the **In Progress** column.
  2. Call `submit_for_review` via MCP with notes "Implemented and validated all checklist items".
  3. Observe Web UI: confirm card moves to the **Ready for Test** column.
  4. Open the card's modal: verify all acceptance criteria checkboxes are checked and agent submission notes are visible in the activity history.

---

### FEAT-04-02: Human QA Verification & Closure Flow
- **ID:** `FEAT-04-02`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As a human engineering manager, I want to verify the completed criteria and click [Verify & Close], so that the feature is officially approved and marked `CLOSED`.*
- **Scope & Description:**
  - Hono API endpoint: `PATCH /api/features/:id/close` (Human-only authority).
  - State machine transition: `READY_FOR_TEST` $\rightarrow$ `CLOSED`.
  - Audit trail record: `action: "CLOSED"`, `actor: "HUMAN"`.
  - Web UI: Detail modal displays prominent green [Verify & Close] button when card is in `READY_FOR_TEST`.
  - Moves card into the **Closed** column upon confirmation.
- **Acceptance Criteria Checklist:**
  - [ ] API enforces Human-Only authorization for `CLOSED` transition.
  - [ ] Modal action bar dynamically shows [Verify & Close] button for `READY_FOR_TEST` tickets.
  - [ ] Clicking [Verify & Close] executes transition, closes modal (or updates header), and moves card to **Closed** column.
  - [ ] Card in **Closed** column displays green success pip.
- **Manual Verification via UI (UAT):**
  1. Click on a card in the **Ready for Test** column.
  2. Verify modal action bar displays the green [Verify & Close] button.
  3. Click [Verify & Close].
  4. Verify the modal reflects status "Closed" and the card is now in the **Closed** column.
  5. Check timeline: confirm an audit entry "Closed by Human" is present.

---

### FEAT-04-03: Rejection & Rework Loop
- **ID:** `FEAT-04-03`
- **Priority:** `HIGH`
- **Status:** `TODO`
- **User Story:**  
  *As a human tester, if the deliverable fails verification, I want to reject the review or request changes, so that the card returns to `IN_PROGRESS` for the agent to revise.*
- **Scope & Description:**
  - Hono API endpoint: `PATCH /api/features/:id/rework` taking rejection notes.
  - State machine transition: `READY_FOR_TEST` $\rightarrow$ `IN_PROGRESS`.
  - Audit trail record: `action: "REWORK_REQUESTED"`, `actor: "HUMAN"`, `details: { reason }`.
  - Web UI: Modal action bar displays [Request Changes] button when ticket is in `READY_FOR_TEST`.
- **Acceptance Criteria Checklist:**
  - [ ] Transition reverts ticket status to `IN_PROGRESS`.
  - [ ] Reason prompt captures human tester's feedback.
  - [ ] Card moves back from **Ready for Test** to **In Progress** column.
  - [ ] Audit log appends reason so agents reading context can see what needs fixing.
- **Manual Verification via UI (UAT):**
  1. Open a card in **Ready for Test**.
  2. Click [Request Changes].
  3. Enter note "Missing error state handling on form submit".
  4. Submit: verify card moves back to **In Progress** column.
  5. Check modal activity timeline to verify the feedback note is visible.
