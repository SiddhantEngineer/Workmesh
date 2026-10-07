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
  - Left: Workmesh brand mark + Project Switcher Dropdown (with "+ New Project" option).
  - Center/Right: Breadcrumb navigation (`Projects / Workmesh / Board`).
  - Far Right: "+ New Ticket" quick button.
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
- **Interaction:** Clicking card opens the **Centered Modal Dialog**.

---

## 4. Ticket Detail & Review (Centered Modal Dialog)

Instead of a sliding drawer or permanent pane, Workmesh uses a **focus-heavy centered modal**:
- **Dimensions:** Max-width 640px, centered with backdrop dim.
- **Header:** Ticket Key (`WM-4`), Status Badge, Priority selector.
- **Primary Action Bar:** Context-aware state transition button:
  - When `PROPOSED`: [Approve] / [Reject] buttons.
  - When `IN_PROGRESS`: [Submit for Review] button.
  - When `READY_FOR_TEST`: [Verify & Close] / [File Bug] buttons.
- **Body:** Description text area.
- **Acceptance Criteria Checklist:** Interactive checkboxes.
- **Linked Bugs:** Mini list of associated defects.
- **Activity Timeline:** Compact chronological log of past events.

---

## 5. Real-Time Feedback: Silent Sync

In accordance with our minimal, distraction-free aesthetic:
- **No noisy indicators:** No blinking live dots, ticker banners, or notification toasts.
- **Seamless State Updates:** When an agent claims a task or transitions status via MCP, the card silently and smoothly shifts into the corresponding column via CSS transition.
