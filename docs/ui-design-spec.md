# Workmesh UI Design Specification (Minimal Design System)

**Status:** Approved for Implementation  
**Design Foundations Source:** `.agents/skills/design-system/SKILL.md`  
**Core Aesthetic:** Minimal, Clean, Bold, System-Adaptive  

---

## 1. Design Foundations & Tokens

Adhering strictly to the **Minimal Design System** skill:

### Color Palette (System Adaptive)
| Semantic Token | Light Mode (Default) | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--surface` | `#F4F4F1` (Warm Alabaster) | `#0C0C09` (Deep Ink) | Main page background |
| `--surface-raised` | `#FFFFFF` (Pure White) | `#161612` (Card Dark) | Cards, Modals, Inputs |
| `--primary` / `--text` | `#0C0C09` (Deep Ink) | `#F4F4F1` (Warm Alabaster) | Primary text, bold headers |
| `--text-muted` | `#666660` | `#999990` | Subtitles, ticket counts |
| `--secondary` / `--accent`| `#312C85` (Deep Indigo) | `#7C75F2` (Soft Indigo) | Primary buttons, active tabs |
| `--border` | `rgba(12, 12, 9, 0.12)` | `rgba(244, 244, 241, 0.12)` | 1px crisp dividers, card borders |
| `--success` | `#16A34A` | `#22C55E` | Verified, Closed, Valid |
| `--warning` | `#D97706` | `#F59E0B` | In Progress, Medium priority |
| `--danger` | `#DC2626` | `#EF4444` | Rejections, Critical, Errors |

### Typography Scale
- **Display / Headings:** `Inter`, weights 600, 700.
- **Primary / Body:** `Open Sans`, weights 400, 500, 600.
- **Monospace:** `Inconsolata`, weights 500, 700 (strictly used for ticket identifiers: `WM-1`, `WM-2`).

### Spacing Scale
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px` (no arbitrary margins or paddings).

---

## 2. Layout & Global Navigation

### Top-Nav Minimalist
- **Slim 48px Header:**
  - Left: Workmesh brand mark.
  - Right: Theme toggle + "+ New Project" trigger button.
- **Dedicated In-Page Breadcrumbs (`<Breadcrumbs />`):**
  - Rendered at the top of route content rather than inside the navbar to maintain a lean, distraction-free header.
  - Structured semantic markup (`<nav>`, `<ol>`, `<li>`, `Link`, chevron dividers).
  - Example: `Projects / Workmesh`.
- **No Sidebars:**
  - 100% horizontal screen real estate is reserved for the 5 Kanban lifecycle columns.

---

## 3. Kanban Board & Card Anatomy

### The 5 Lifecycle Columns
1. **Proposed** (Awaiting human approval)
2. **Approved** (Backlog ready for agents to claim)
3. **In Progress** (Actively being worked on)
4. **Ready for Test** (Submitted by agent; awaiting human QA)
5. **Closed** (Verified deliverables)

### Compact Editorial Card
- **Key Badge:** `Inconsolata` monospace tag (e.g. `WM-4`).
- **Priority Pip:** 6px colored dot (`Low`, `Medium`, `High`, `Critical`).
- **Title:** `Open Sans` 500 weight, high contrast, max 2 lines with clean ellipsis.
- **Footer:** Criteria progress counter (`✓ 2/3 criteria`) or Bug link tag (`🐛 1 bug`).
### Compact Editorial Card
- **Key Badge:** `Inconsolata` monospace tag (e.g. `WM-4`).
- **Priority Pip:** 6px colored dot (`Low`, `Medium`, `High`, `Critical`).
- **Title:** `Open Sans` 500 weight, high contrast, max 2 lines with clean ellipsis.
- **Footer:** Criteria progress counter (`✓ 2/3 criteria`) or Bug link tag (`🐛 1 bug`).
- **Interaction:** Clicking card navigates to `/projects/[key]/features/[featureKey]`.

---

## 4. Route-Driven Detail Hierarchy & Scoped Modals

To ensure bookmarkability, deep linking, full screen real estate, and zero "Russian doll" modal nesting, all detailed inspections use **dedicated route pages**, while modals are strictly reserved for **quick transactional creation**.

### 4.1 Route Hierarchy
- **`/` (Projects Directory):** Overview of all workspaces with `+ New Project` creation modal.
- **`/projects/[key]` (Project Hub):** Epics roadmap, feature lists, and the 5-column Kanban board.
- **`/projects/[key]/features/[featureKey]` (Feature Detail Page):** Full inspection view with two-column layout.
- **`/projects/[key]/bugs/[bugKey]` (Bug Detail Page):** Defect inspection, reproduction steps, and resolution notes.

### 4.2 Feature Detail View (`/projects/[key]/features/[featureKey]`)
- **Breadcrumbs:** `Projects / [Project Name] / Features / WM-4`
- **Main Content (Left / Center):**
  - Ticket Key (`WM-4`), Status Badge, Priority selector.
  - Full Description markdown view/editor.
  - **Acceptance Criteria Checklist:** Interactive full-width checkboxes.
  - **Linked Bugs Section:** Cards for each defect showing status (`OPEN` / `RESOLVED`), priority, and a `+ Report Bug` modal trigger. Clicking any bug navigates to its Bug Detail Page.
- **Sidebar / Action Rail (Right):**
  - **Context-Aware Action Bar:**
    - When `PROPOSED`: [Approve] / [Reject] buttons.
    - When `IN_PROGRESS`: [Submit for Review] button.
    - When `READY_FOR_TEST`: [Verify & Close] / [Request Changes] buttons.
  - Assignee / Actor info (`HUMAN` vs `AGENT`).
  - **Activity Timeline:** Chronological log of past transitions and comments.

### 4.3 Bug Detail View (`/projects/[key]/bugs/[bugKey]`)
- **Breadcrumbs:** `Projects / [Project Name] / Bugs / WM-B1` (with parent feature link back to `WM-4`).
- **Main Content:**
  - Title, Priority Pip, Status Badge (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  - Reproduction Steps & Environment details.
  - Fix & Resolution Notes.
  - Action Bar: [Claim Bug], [Resolve Bug], [Close Bug].
  - Audit Trail of bug lifecycle.

### 4.4 Scoped Modals (Creation Only)
Modals are strictly used for ephemeral creation flows:
- `+ New Project` modal
- `+ Propose Feature` modal
- `+ File Bug` modal
- Rejection / Rework reason prompt dialog

---

## 5. Real-Time Feedback: Silent Sync

In accordance with our minimal, distraction-free aesthetic:
- **No noisy indicators:** No blinking live dots, ticker banners, or notification toasts.
- **Seamless State Updates:** When an agent claims a task or transitions status via MCP, cards on the board and status badges on detail pages silently update via TanStack Query invalidation driven by SSE.

