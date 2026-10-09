# Workmesh Agent Task Tracker

**Document Version:** 1.0.0  
**Status Model:** Simplified 3-State (`TODO` | `IN_PROGRESS` | `DONE`)  
**Scope Reference:** [docs/mvp-scope-spec.md](file:///d:/Projects/Workmesh/docs/mvp-scope-spec.md)  
**UI Spec Reference:** [docs/ui-design-spec.md](file:///d:/Projects/Workmesh/docs/ui-design-spec.md)  

---

## 1. Active Task Slot

> **CRITICAL RULE FOR ALL AGENTS:**  
> Before writing any code, check this slot. If a task is marked `IN_PROGRESS`, review the latest entry in Section 4 (Session Handoff Notes) and continue that task. If this slot is `NONE`, pick the next highest-priority `TODO` feature from the matrix below, set this slot to `IN_PROGRESS`, and begin.

| Property | Value |
| :--- | :--- |
| **Current Task ID** | `FEAT-01-02` |
| **Feature Title** | MCP Server Initialization & `get_project_context` Tool |
| **Epic** | [Epic 01: Project Foundation & MCP Context](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md) |
| **Status** | `TODO` |
| **Active Session / Agent ID** | Ready to be claimed |
| **Started At** | Pending claim |

---

## 2. Master Feature Matrix

### Epic 01: Project Foundation & MCP Context
*File: [docs/epics/epic-01-project-and-mcp-context.md](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01-01` | Project Management & Workspace Switcher | `HIGH` | `DONE` | UI UAT (Project switcher & creation verified) |
| `FEAT-01-02` | MCP Server Init & `get_project_context` Tool | `CRITICAL` | `TODO` | MCP Inspector / Stdio + UI context match |

---

### Epic 02: Epic & Feature Proposal and Human Approval
*File: [docs/epics/epic-02-proposal-and-human-approval.md](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-02-01` | Epic Proposal & Breakdown Flow | `HIGH` | `TODO` | MCP `propose_epic` + UI Epic filter pills |
| `FEAT-02-02` | Feature Proposal with Acceptance Criteria Flow | `CRITICAL` | `TODO` | MCP `propose_feature` + UI "+ New Ticket" modal |
| `FEAT-02-03` | Proposed Column & Human Approval / Rejection Flow | `CRITICAL` | `TODO` | UI Kanban 1-click Approve/Reject action buttons |

---

### Epic 03: Task Discovery & Agent Claiming
*File: [docs/epics/epic-03-task-discovery-and-agent-claiming.md](file:///d:/Projects/Workmesh/docs/epics/epic-03-task-discovery-and-agent-claiming.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-03-01` | Actionable Task Discovery Flow | `CRITICAL` | `TODO` | MCP `list_actionable_tasks` matching Approved column |
| `FEAT-03-02` | Task Claiming Flow | `CRITICAL` | `TODO` | MCP `claim_task` shifting card to In Progress column |
| `FEAT-03-03` | Centered Ticket Detail Modal & Criteria Management | `HIGH` | `TODO` | UI 640px modal dialog & criteria checklist toggles |

---

### Epic 04: Deliverable Review & Human Sign-Off
*File: [docs/epics/epic-04-deliverable-review-and-human-signoff.md](file:///d:/Projects/Workmesh/docs/epics/epic-04-deliverable-review-and-human-signoff.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-04-01` | Agent Submission & Ready for Test Flow | `CRITICAL` | `TODO` | MCP `submit_for_review` shifting card to Ready for Test |
| `FEAT-04-02` | Human QA Verification & Closure Flow | `CRITICAL` | `TODO` | UI [Verify & Close] button shifting card to Closed |
| `FEAT-04-03` | Rejection & Rework Loop | `HIGH` | `TODO` | UI [Request Changes] returning card to In Progress |

---

### Epic 05: Defect Tracking & Bug Lifecycle
*File: [docs/epics/epic-05-bug-tracking-and-resolution.md](file:///d:/Projects/Workmesh/docs/epics/epic-05-bug-tracking-and-resolution.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-05-01` | Bidirectional Bug Reporting Flow | `CRITICAL` | `TODO` | UI "+ File Bug" modal & MCP `report_bug` |
| `FEAT-05-02` | Bug Claiming & Resolution Flow | `HIGH` | `TODO` | MCP `resolve_bug` + UI [Close Bug] verification |
| `FEAT-05-03` | Feature Closure Blocker Check | `MEDIUM` | `TODO` | UI [Verify & Close] disabled when open bugs exist |

---

### Epic 06: Silent Real-Time Sync & Live Audit Trail
*File: [docs/epics/epic-06-realtime-sse-sync-and-activity-audit.md](file:///d:/Projects/Workmesh/docs/epics/epic-06-realtime-sse-sync-and-activity-audit.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-06-01` | SSE Streaming Pipeline & Silent Transitions | `CRITICAL` | `TODO` | Live multi-window test: instant silent column shift |
| `FEAT-06-02` | Chronological Activity Audit Timeline | `HIGH` | `TODO` | UI modal activity timeline showing Human vs Agent |
| `FEAT-06-03` | Connection Health & Auto-Reconnection | `MEDIUM` | `TODO` | Server restart test: auto-reconnect without page reload |

---

## 3. Standard Operating Procedure for Incoming Agents

Whenever a new chat session starts or an autonomous agent takes over:

1. **Step 1: Ingest Context**
   - Read this file (`docs/AGENT_TRACKER.md`).
   - Check the **Active Task Slot**.
   - If an ongoing task is marked `IN_PROGRESS`, resume that task.
   - If no task is `IN_PROGRESS`, identify the next `TODO` feature from Section 2 in sequential order.
2. **Step 2: Claim Task in Tracker**
   - Update the **Active Task Slot** with the selected `Feature ID`, your Agent/Session identifier, and the current timestamp.
   - Change the feature's status in Section 2 from `TODO` to `IN_PROGRESS`.
3. **Step 3: Consult the Epic Spec**
   - Open the corresponding epic markdown file in `docs/epics/`.
   - Read the Feature's User Story, Scope, Acceptance Criteria, and UAT steps.
4. **Step 4: Implement Vertical Slice**
   - Implement across the required layers (DB schema/migration, shared Zod types, Hono API routes, MCP tool, Next.js UI).
   - Ensure you follow the Minimal Design System tokens and rules.
5. **Step 5: Perform UAT Verification**
   - Follow the feature's **Manual Verification via UI (UAT)** steps.
   - Confirm everything renders and behaves cleanly without regressions.
6. **Step 6: Update Tracker & Log Handoff**
   - Update the feature's status in Section 2 to `DONE`.
   - Clear the **Active Task Slot** (or assign the next feature if continuing).
   - Append a clear summary entry in Section 4 (**Session Handoff Notes**) outlining:
     - What was implemented.
     - How UAT was verified.
     - Specific instructions or context for the subsequent agent.

---

## 4. Session Handoff Notes

### Session 00: Project Baseline Setup
- **Date / Timestamp:** 2026-10-10 Baseline
- **Completed:** `FEAT-01-01` (Project Management & Workspace Switcher)
- **Summary:**
  - Database schema for `projects`, `epics`, `features`, `bugs`, `activity_logs`, and relations created.
  - Hono API endpoints for project creation and retrieval implemented.
  - Web UI Next.js app created with Top-Nav, Minimal Design System theme tokens, and Project Creation modal.
- **Handoff for Next Agent:**
  - Next task is `FEAT-01-02` in [Epic 01](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md): Setup the MCP server in `packages/mcp-server` and implement `get_project_context`.
