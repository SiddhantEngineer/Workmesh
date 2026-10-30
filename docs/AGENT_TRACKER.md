# Workmesh Agent Task Tracker

**Document Version:** 1.1.0  
**Status Model:** Simplified 3-State (`TODO` | `IN_PROGRESS` | `DONE`)  
**Scope Reference:** [docs/mvp-scope-spec.md](file:///d:/Projects/Workmesh/docs/mvp-scope-spec.md)  
**UI Spec Reference:** [docs/ui-design-spec.md](file:///d:/Projects/Workmesh/docs/ui-design-spec.md)  
**Frontend Architecture:** [docs/frontend-architecture-spec.md](file:///d:/Projects/Workmesh/docs/frontend-architecture-spec.md)  

---

## 1. Active Task Slot

> **CRITICAL RULE FOR ALL AGENTS:**  
> Before writing any code, check this slot. If a task is marked `IN_PROGRESS`, review the latest entry in Section 4 (Session Handoff Notes) and continue that task. If this slot is `NONE`, pick the next highest-priority `TODO` feature from the matrix below, set this slot to `IN_PROGRESS`, and begin.

| Property | Value |
| :--- | :--- |
| **Current Task ID** | `NONE` |
| **Feature Title** | None |
| **Epic** | None |
| **Status** | `DONE` |
| **Active Session / Agent ID** | `NONE` |
| **Started At** | - |

---

## 2. Master Feature Matrix

### Epic 01: Project Foundation & MCP Context
*File: [docs/epics/epic-01-project-and-mcp-context.md](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01-01` | Projects Directory & Workspace Creation (`/`) | `HIGH` | `DONE` | UI UAT (Project switcher & creation modal verified) |
| `FEAT-01-02` | Project Hub & Details Route (`/projects/[key]`) | `CRITICAL` | `DONE` | Next.js build + UI UAT verified (assumes WM exists) |
| `FEAT-01-03` | MCP Server Init & `get_project_context` Tool | `CRITICAL` | `DONE` | MCP Inspector stdio live call + DB auth & UI context match |
| `FEAT-01-04` | Project Theming & Split Hero Card Header | `HIGH` | `DONE` | UI UAT (Theme preview cards, ProjectCard, and Split Hero Card verified) |

---

### Epic 02: Epic & Feature Proposal and Human Approval
*File: [docs/epics/epic-02-proposal-and-human-approval.md](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-02-01` | Epic Creation & Breakdown Flow | `HIGH` | `DONE` | MCP `create_epic` live call + UI CreateEpicModal & EpicsFilterBar verified |
| `FEAT-02-02` | Feature Creation with Acceptance Criteria Flow | `CRITICAL` | `DONE` | Live REST API + MCP `create_feature` + UI CreateFeatureModal verified |
| `FEAT-02-03` | Proposed Column & Human Approval / Rejection Flow | `CRITICAL` | `DONE` | UI Kanban 1-click Approve/Reject action buttons + API human-only guard + DB audit log |

---

### Epic 03: Task Discovery & Agent Claiming
*File: [docs/epics/epic-03-task-discovery-and-agent-claiming.md](file:///d:/Projects/Workmesh/docs/epics/epic-03-task-discovery-and-agent-claiming.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-03-01` | Actionable Task Discovery Flow | `CRITICAL` | `DONE` | Live MCP `list_actionable_tasks` stdio call + REST API + Web UI Ready to Claim badge |
| `FEAT-03-02` | Task Claiming Flow | `CRITICAL` | `DONE` | Live MCP `claim_task` stdio call + atomic status shift to IN_PROGRESS + DB audit log verified |
| `FEAT-03-03` | Dedicated Feature Detail Page (`/projects/[key]/features/[featureKey]`) | `HIGH` | `DONE` | UI UAT (Dedicated 2-column view, criteria checklist toggles verified via API & UI) |

---

### Epic 04: Deliverable Review & Human Sign-Off
*File: [docs/epics/epic-04-deliverable-review-and-human-signoff.md](file:///d:/Projects/Workmesh/docs/epics/epic-04-deliverable-review-and-human-signoff.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-04-01` | Agent Submission & Ready for Test Flow | `CRITICAL` | `DONE` | Live MCP `submit_for_review` call + negative state guard + DB audit log + UI Ready for Test badge |
| `FEAT-04-02` | Human QA Verification & Closure Flow | `CRITICAL` | `TODO` | UI Action Rail [Verify & Close] button shifting card to Closed |
| `FEAT-04-03` | Rejection & Rework Loop | `HIGH` | `TODO` | UI Action Rail [Request Changes] returning card to In Progress |

---

### Epic 05: Defect Tracking & Bug Lifecycle
*File: [docs/epics/epic-05-bug-tracking-and-resolution.md](file:///d:/Projects/Workmesh/docs/epics/epic-05-bug-tracking-and-resolution.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-05-01` | Bidirectional Bug Reporting & Linked Bugs Flow | `CRITICAL` | `TODO` | UI "+ File Bug" modal & feature card linked bugs list |
| `FEAT-05-02` | Dedicated Bug Detail Page (`/projects/[key]/bugs/[bugKey]`) | `HIGH` | `TODO` | UI UAT (Repro steps view, MCP `resolve_bug` + [Close Bug]) |
| `FEAT-05-03` | Feature Closure Blocker Check | `MEDIUM` | `TODO` | UI [Verify & Close] disabled when open bugs exist |

---

### Epic 06: Silent Real-Time Sync & Live Audit Trail
*File: [docs/epics/epic-06-realtime-sse-sync-and-activity-audit.md](file:///d:/Projects/Workmesh/docs/epics/epic-06-realtime-sse-sync-and-activity-audit.md)*

| Feature ID | Feature Name | Priority | Status | Verified Via |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-06-01` | SSE Streaming Pipeline & Silent Transitions | `CRITICAL` | `TODO` | Live multi-window test: instant silent column shift |
| `FEAT-06-02` | Chronological Activity Audit Timeline | `HIGH` | `TODO` | UI action rail activity timeline showing Human vs Agent |
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
   - Ensure you follow the Minimal Design System tokens and route hierarchy.
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
- **Completed:** `FEAT-01-01` (Projects Directory & Workspace Creation `/`)
- **Summary:**
  - Database schema for `projects`, `epics`, `features`, `bugs`, `activity_logs`, and relations created.
  - Hono API endpoints for project creation and retrieval implemented.
  - Web UI Next.js app created with Directory Dashboard (`/`), Top-Nav, Minimal Design System theme tokens, and Project Creation modal.
- **Handoff for Next Agent:**
  - Next task is `FEAT-01-02` in [Epic 01](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md): Build the Project Hub & Details Route (`/projects/[key]`), displaying project metadata, roadmap skeleton, and features/kanban board view.

### Session 01: Project Hub & Details Route (`/projects/[key]`)
- **Date / Timestamp:** 2026-10-10
- **Completed:** `FEAT-01-02` (Project Hub & Details Route `/projects/[key]`)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):** Modularized domain schemas into dedicated files with clean responsibility separation:
    - `enums.ts`: `Priority`, `EpicStatus`, `FeatureStatus`, `BugStatus`, `EntityType`.
    - `epics.ts`: `EpicSummary` and `Epic` as independent data models (not inheriting/extending each other).
    - `features.ts`: `FeatureSummary` and `Feature` as independent data models (not inheriting/extending each other), plus `AcceptanceCriterion`.
    - `projects.ts`: `createProjectSchema`, `CreateProjectInput`, `Project`, and lightweight `ProjectDetail`.
  - **Hono REST API (`@workmesh/api`):** 
    - Updated `GET /api/projects/:key` in `apps/api/src/routes/projects.ts` to strictly query by uppercase key prefix (removed unused numeric ID lookup).
    - Optimized response payload for the listing view: selectively projects only summary columns for `epics` and `features`, avoiding bloat from heavy markdown descriptions and audit fields.
  - **Web Client & State (`@workmesh/web`):**
    - Removed unused `getById` and `useProjectQuery(id)`.
    - Added `projectsApi.getByKey(key)` and React Query hook `useProjectByKeyQuery(key)` with deterministic query key `projectKeys.byKey(key)`.
  - **Web UI & Components:**
    - Route `apps/web/src/app/projects/[key]/page.tsx` with loading skeleton and not-found fallback.
    - `Breadcrumbs`: Dedicated reusable component (`apps/web/src/components/ui/Breadcrumbs.tsx`) rendering semantic, accessible in-page navigation.
    - `TopNav`: Lean, minimalist brand header (breadcrumbs moved inside page to eliminate duplication).
    - `ProjectHeader`: Project title, uppercase prefix badge (`WM`), description, ticket counters, "+ Propose Feature" trigger, and Kanban vs List view switcher.
    - `EpicsFilterBar`: Roadmap filter tabs with ticket badges and feature count pills, conditionally rendered only when active epics exist.
    - `KanbanBoard`: 5 lifecycle columns (Proposed, Approved, In Progress, Ready for Test, Closed) with column counters, empty column states, and full empty-board state using `FeatureSummary`.
    - `FeaturesListView`: Clean tabular view for inspecting features using `FeatureSummary` and `EpicSummary`.
    - `FeatureCard`: Compact editorial card with Inconsolata monospace key badge (`WM-2`), priority pip, title, and criteria checklist progress (`✓ 0/3 criteria`).
- **Verification & UAT:**
  - Ran TypeScript checks across `apps/web` and shared packages with 0 errors.
  - Next.js production build (`@workmesh/web`) verified with optimized static and dynamic routes.
  - UAT Assumption: Assumes demo project `Workmesh` (`WM`) exists in the database. Clicking `ProjectCard` navigates to `/projects/WM`, renders breadcrumbs `Projects / Workmesh`, and clicking `Projects` returns seamlessly to `/`.
- **Handoff for Next Agent:**
  - Next task is `FEAT-01-03` in [Epic 01](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md): MCP Server Initialization & `get_project_context` Tool.

---

### Session 02: Project Theming & Split Hero Card Header (`FEAT-01-04`)
- **Date / Timestamp:** 2026-10-10
- **Completed:** `FEAT-01-04` (Project Theming & Split Hero Card Header)
- **What Was Implemented:**
  - **Database & Drizzle (`@workmesh/db`):**
    - Created `themes` table (`packages/db/src/schema/themes.ts`) with unique slug `key`, display `name`, and extensible `tokens: jsonb` typed with `ThemeTokens`.
    - Added `themeId` foreign key to `projects` referencing `themes.id` (`NOT NULL`).
    - Configured centralized Drizzle relations in `relations.ts`.
    - Generated and executed migration `0002_wakeful_zuras.sql` with safe two-phase backfill and seeded 5 presets: `flora-blue` (inspired by reference image), `classic-slate`, `sage-forest`, `sunset-warmth`, and `velvet-orchid`.
  - **Shared Schemas (`@workmesh/shared`):**
    - Created `packages/shared/src/themes.ts` defining `Theme`, `ThemeTokens`, `CardThemeTokens`, and Zod schemas.
    - Updated `createProjectSchema` to require positive integer `themeId`.
    - Updated `Project` interface to include `themeId: number`.
  - **Hono REST API (`@workmesh/api`):**
    - Created `GET /api/themes` in `apps/api/src/routes/themes.ts` returning preset themes for client caching.
    - Mounted `/api/themes` in `apps/api/src/index.ts`.
    - Updated `POST /api/projects` in `apps/api/src/routes/projects.ts` to persist `themeId`.
  - **Web Client & Styling (`@workmesh/web`):**
    - Created `apps/web/src/features/themes/` module with `api.ts`, `queries.ts` (`useThemesQuery` with `staleTime: Infinity`, `useProjectTheme`), and `utils.ts` (`getThemeVariables`).
    - Updated `apps/web/src/app/globals.css` with scoped `.themed-card`, `.project-card`, and `.themed-hero-left` CSS variable rules adapting dynamically across light and dark modes.
    - `CreateProjectModal`: Added visual grid of theme template preview cards with header text, mode-aware colors, and interactive selection.
    - `ProjectCard`: Full card themed styling with contrast borders and muted text.
    - `ProjectHeader`: Redesigned Split Hero Card inspired by reference image telemetry banner (themed left panel, dark telemetry right panel with ticket counts and "+ Propose Feature" trigger, sub-bar with Kanban/List switcher).
- **Verification & UAT:**
  - `GET /api/themes` verified with curl returning all 5 seeded themes.
  - Full Next.js production build (`@workmesh/web`) passed with 0 errors.
  - UI verified by user: theme preview swatches, directory project cards, and Split Hero Card header display correct colors.
- **Handoff for Next Agent:**
  - Next task is `FEAT-01-03` in [Epic 01](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md): MCP Server Initialization & `get_project_context` Tool.

---

### Session 03: Interaction & Animation System Implementation
- **Date / Timestamp:** 2026-10-10
- **Completed:** Interaction & Animation Specification ([docs/interaction-and-animation-spec.md](file:///d:/Projects/Workmesh/docs/interaction-and-animation-spec.md)) and application across all existing pages.
- **What Was Implemented:**
  - **Interaction Spec (`docs/interaction-and-animation-spec.md`):** Comprehensive design tokens (`--duration-*`, `--ease-*`), micro-interaction states, 0ms tactile feedback locks, GPU-only acceleration guidelines, and `@media (prefers-reduced-motion: reduce)` accessibility rules.
  - **UI Design Spec Integration (`docs/ui-design-spec.md`):** Cross-referenced animation specification under Section 1.2.
  - **Design System & Global CSS (`apps/web/src/app/globals.css`):**
    - Motion tokens added to `:root`.
    - Keyframes: `fadeIn`, `modalPop`, `slideInDown`, `cardEntrance`, `heroEntrance`, `shimmer`, `spin`.
    - Interactive utility classes: `.btn-primary`, `.btn-secondary`, `.brand-link`, `.theme-toggle-btn`, `.breadcrumb-link`, `.view-switcher-button`, `.filter-pill`, `.list-table-row`, `.action-link`, `.action-arrow`, `.feature-card`, `.theme-preview-card`, `.skeleton-shimmer`, `.error-card`.
    - Reduced motion accessibility rules preventing animations when user prefers reduced motion.
  - **Component Animations Applied:**
    - `FeatureCard.tsx`: Smooth hover lift, elevation shadow, active scale snap.
    - `FeaturesListView.tsx`: Table row hover highlight, action link arrow glide (`translateX(3px)`).
    - `EpicsFilterBar.tsx`: Interactive filter pills with hover lift and active scale down.
    - `ProjectHeader.tsx`: Hero entrance animation, view switcher button tab transitions.
    - `TopNav.tsx`: Brand link hover feedback.
    - `ThemeToggle.tsx`: Tactile hover tilt (`15deg`) and active click rotate (`45deg`) / scale.
    - `Breadcrumbs.tsx`: Interactive link hover transitions.
    - `CreateProjectModal.tsx`: Theme preview cards with interactive hover lift and active snap.
    - `ProjectHubPage` (`page.tsx`): Error card entrance pop and primary action button press.
- **Handoff for Next Agent:**
  - Resume development on next roadmap task: `FEAT-01-03` in [Epic 01](file:///d:/Projects/Workmesh/docs/epics/epic-01-project-and-mcp-context.md): MCP Server Initialization & `get_project_context` Tool in `@workmesh/mcp-server`.

---

### Session 04: MCP Server Initialization & `get_project_context` Tool (`FEAT-01-03`)
- **Date / Timestamp:** 2026-10-12
- **Completed:** `FEAT-01-03` (MCP Server Init & `get_project_context` Tool)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Defined `ACTIVE_EPIC_STATUSES = ["PROPOSED", "APPROVED", "IN_PROGRESS"]` in `packages/shared/src/enums.ts` avoiding magic strings and aligning with Drizzle ORM typing.
    - Added `getProjectContextInputSchema` in `packages/shared/src/projects.ts` with context budget controls (`epicLimit` capped at 50, `includeDescriptions` defaulting to false).
    - Added `ActiveEpicSummary` and `ProjectContextSummary` interfaces with pagination signaling (`hasMoreEpics`).
  - **Modular MCP Server Architecture (`@workmesh/mcp-server`):**
    - Initialized workspace package `@workmesh/mcp-server` with `@modelcontextprotocol/sdk`.
    - `src/tools/projects.ts`: Registered `get_project_context` using modern `server.registerTool`.
    - `src/tools/index.ts`: Master tool aggregator to mount future epic tools (`epics.ts`, `tasks.ts`, `bugs.ts`).
    - `src/server.ts`: Factory creating `McpServer` instance and mounting domain tools.
    - `src/index.ts`: Lean CLI executable entrypoint handling environment loading, stdio transport, and graceful `SIGINT`/`SIGTERM` process teardown.
  - **Database Efficiency & Guardrails (`@workmesh/db`):**
    - Pushed filtering, counting (`count()`), and pagination directly down to PostgreSQL using `drizzle-orm` operators.
    - Implemented `limit: epicLimit + 1` SQL lookahead pattern to calculate `hasMoreEpics` in a single query.
    - Eliminated dangerous arbitrary fallbacks; enforced explicit project identification (`projectKey` or `projectId`).
    - Fixed root `.env` loading in `packages/db/src/client.ts` (`dotenv.config()` + `dotenv.config({ path: "../../.env" })`) to resolve correct PostgreSQL authentication across monorepo root and subpackages.
- **Verification & UAT:**
  - TypeScript build (`cmd /c npm run build --workspace=@workmesh/mcp-server`) verified with 0 errors.
  - Manually verified via MCP Inspector over stdio protocol:
    1. Tool `get_project_context` discovered with full schema.
    2. Executed with `{ projectKey: "WM" }`, authenticated with PostgreSQL database, and returned project metadata and active epics matching the Web UI.
    3. Confirmed negative guard prevents silent context contamination when identifiers are omitted.
- **Handoff for Next Agent:**
  - **Epic 01 is now 100% complete!**
  - Next task is `FEAT-02-01` in [Epic 02: Epic & Feature Proposal and Human Approval](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md): Epic Proposal & Breakdown Flow (`propose_epic` MCP tool + UI Epic filter pills).

---

### Session 05: Epic 01 Architectural Remediation & Backend Refactoring
- **Date / Timestamp:** 2026-10-13
- **Completed:** Full backend architectural remediation across `@workmesh/db`, `@workmesh/api`, and `@workmesh/mcp-server`.
- **What Was Implemented:**
  - **Shared Domain Services Layer (`@workmesh/db/src/services`):**
    - Created `packages/db/src/services/activity_logs.ts` with `recordActivity` helper to guarantee standardized audit records across both Hono API and MCP tools.
    - Created `packages/db/src/services/projects.ts` containing:
      - `createProject`: Wrapped in `db.transaction()` with atomic catch of Postgres `23505` constraint violations (throwing typed `DuplicateProjectKeyError` for clean 409 responses).
      - `listProjects`: Efficient active projects query sorted newest first.
      - `getProjectByKey`: Relational fetch including active epics and features.
      - `getProjectContext`: Consolidated count queries using SQL `FILTER (WHERE status = ANY(...))`, active epics slice, feature breakdown stats + open bugs count, and smart default project resolution (checking `WORKMESH_PROJECT_KEY`, auto-selecting single active project, or listing available keys).
    - Exported services from `@workmesh/db` root entrypoint.
  - **Database Schema & Indexing Fix (`@workmesh/db/src/schema/projects.ts`):**
    - Replaced hard table `.unique()` constraint with partial unique index: `uniqueIndex("projects_key_active_idx").on(table.key).where(sql`deleted_at IS NULL`)` to allow soft-deleted project keys to be reused or recreated.
  - **API Layer Refactoring (`apps/api`):**
    - Refactored `apps/api/src/routes/projects.ts` to delegate directly to domain services, removing raw SQL duplication and TOCTOU race conditions.
    - Added centralized `app.notFound` and `app.onError` middleware in `apps/api/src/index.ts` returning structured `{ success: false, error: { message, code } }` JSON responses.
  - **MCP Server Refactoring (`packages/mcp-server`):**
    - Refactored `get_project_context` tool in `packages/mcp-server/src/tools/projects.ts` to delegate directly to `getProjectContext`, eliminating query duplication and providing rich, human-readable error messages for missing or ambiguous projects.
- **Verification & QA:**
  - TypeScript workspace typecheck (`npx tsc --noEmit`) verified 0 errors across all packages.
  - Verified MCP server build (`npm run mcp:build`) with exit code 0.
- **Handoff for Next Agent:**
  - Next task is `FEAT-02-01` in [Epic 02: Epic & Feature Proposal and Human Approval](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md): Epic Creation & Breakdown Flow.

---

### Session 06: Epic Creation & Breakdown Flow (`FEAT-02-01`)
- **Date / Timestamp:** 2026-10-13
- **Completed:** `FEAT-02-01` (Epic Creation & Breakdown Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Defined `createEpicBodySchema` & `createEpicInputSchema` in `packages/shared/src/epics.ts`.
    - Added `key?: string;` property to `Epic` and `EpicSummary` interfaces to carry computed badge identifiers (e.g., `WM-1`).
  - **Database Domain Service (`@workmesh/db`):**
    - Created `packages/db/src/services/epics.ts` implementing `createEpic` and `listEpics`.
    - `createEpic` uses PostgreSQL atomic row update (`UPDATE projects SET next_ticket_number = next_ticket_number + 1 RETURNING next_ticket_number`) inside a transaction to allocate unique, gapless ticket numbers.
    - Automatically records an audit log entry via `recordActivity` with entity type `EPIC` and action `CREATED`.
    - Exported from `@workmesh/db` index.
  - **Hono REST API (`apps/api`):**
    - Created `apps/api/src/routes/epics.ts` with `POST /api/projects/:key/epics` and `GET /api/projects/:key/epics`.
    - Mounted on `apps/api/src/index.ts`.
  - **Web Client & State (`apps/web`):**
    - Created `apps/web/src/features/epics/api.ts` and `apps/web/src/features/epics/queries.ts` (`useCreateEpicMutation`, `useEpicsQuery`) with automatic cache invalidation for the project hub.
    - Created `apps/web/src/features/epics/components/CreateEpicModal.tsx` following the Minimal Design System and interaction tokens (`.animate-modal`, `.animate-backdrop`, snappy 0ms tactile feedback).
    - Updated `ProjectHeader.tsx` with `+ Create Epic` button in the telemetry actions column.
    - Updated `EpicsFilterBar.tsx` to render an orange `Proposed` badge for newly staged epics and an inline `+ Epic` action button.
    - Wired modal state and mutation into `apps/web/src/app/projects/[key]/page.tsx`.
  - **MCP Server (`packages/mcp-server`):**
    - Implemented `create_epic` tool in `packages/mcp-server/src/tools/epics.ts` with parameter validation using `createEpicInputSchema`.
    - Mounted in `packages/mcp-server/src/tools/index.ts`.
- **Verification & UAT:**
  - Full workspace TypeScript typecheck (`npx tsc --noEmit`) verified with 0 errors across all packages.
  - MCP tool live execution manually verified via MCP Inspector.
  - REST API verified live: `POST /api/projects/WM/epics` created epic `WM-1` in `PROPOSED` status and `GET /api/projects/WM/epics` returned the list.
- **Handoff for Next Agent:**
  - Next task is `FEAT-02-02` in [Epic 02: Epic & Feature Proposal and Human Approval](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md): Feature Creation with Acceptance Criteria Flow.

---

### Session 07: Feature Creation with Acceptance Criteria Flow (`FEAT-02-02`)
- **Date / Timestamp:** 2026-10-14
- **Completed:** `FEAT-02-02` (Feature Creation with Acceptance Criteria Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Defined `createFeatureBodySchema` (enforcing `epicId`, title, description, priority, and `min(1)` criteria) and `createFeatureInputSchema` in `packages/shared/src/features.ts`.
    - Added `key?: string;` property to `Feature` and `FeatureSummary` interfaces for formatted ticket keys (e.g. `WM-4`).
  - **Database Domain Service (`@workmesh/db`):**
    - Created `packages/db/src/services/features.ts` with `createFeature` and `listFeatures`.
    - `createFeature` validates parent Epic existence and cross-project boundary integrity.
    - Atomically claims the next project-scoped sequence counter from `projects.nextTicketNumber` in a PostgreSQL row-locked transaction.
    - Normalizes criteria strings into structured JSON `{ text, completed: false }` saved in PostgreSQL `jsonb`.
    - Persists feature with initial status `PROPOSED` and records audit entry via `recordActivity`.
    - Exported from `@workmesh/db` index.
  - **Hono REST API (`apps/api`):**
    - Created `apps/api/src/routes/features.ts` with `projectFeaturesRouter` (`GET /api/projects/:key/features`, `POST /api/projects/:key/features`) and `epicFeaturesRouter` (`POST /api/epics/:epicId/features`).
    - Mounted in `apps/api/src/index.ts`.
  - **Web Client & State (`apps/web`):**
    - Created `apps/web/src/features/features/api.ts` and `apps/web/src/features/features/queries.ts` (`useCreateFeatureMutation`, `useFeaturesQuery`) with cache invalidation of the project hub.
    - Created `apps/web/src/features/features/components/CreateFeatureModal.tsx` following the Minimal Design System and interaction tokens (`.animate-modal`, `.animate-backdrop`, 0ms tactile feedback) with parent Epic selector and dynamic criteria checklist builder.
    - Wired `isCreateFeatureOpen` into `apps/web/src/app/projects/[key]/page.tsx` on `ProjectHeader` and `KanbanBoard` triggers.
  - **MCP Server (`packages/mcp-server`):**
    - Implemented `create_feature` tool in `packages/mcp-server/src/tools/features.ts` using `createFeatureInputSchema`.
    - Mounted in `packages/mcp-server/src/tools/index.ts`.
- **Verification & UAT:**
  - Full workspace TypeScript typecheck (`npx tsc --noEmit`) verified with 0 errors across all packages.
  - MCP package build (`npm run build --workspace=@workmesh/mcp-server`) verified with exit code 0.
  - Live REST API verified: `POST /api/projects/WM/features` created feature `WM-4` under Epic `WM-1` with 2 acceptance criteria in `PROPOSED` status, and `GET /api/projects/WM` reflected updated counters and feature list.
- **Handoff for Next Agent:**
  - Next task is `FEAT-02-03` in [Epic 02: Epic & Feature Proposal and Human Approval](file:///d:/Projects/Workmesh/docs/epics/epic-02-proposal-and-human-approval.md): Proposed Column & Human Approval / Rejection Flow (`PATCH /api/features/:id/approve` and `PATCH /api/features/:id/reject`, UI Kanban 1-click Approve/Reject action buttons, and Human-only enforcement rule).

---

### Session 08: Proposed Column & Human Approval / Rejection Flow (`FEAT-02-03`)
- **Date / Timestamp:** 2026-10-14
- **Completed:** `FEAT-02-03` (Proposed Column & Human Approval / Rejection Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Defined `approveFeatureBodySchema` (optional notes) and `rejectFeatureBodySchema` (required reason string) in `packages/shared/src/features.ts`.
  - **Database Domain Service (`@workmesh/db`):**
    - Added `approveFeature(featureId, options, actor)` and `rejectFeature(featureId, options, actor)` to `packages/db/src/services/features.ts`.
    - Added `FeatureNotFoundError`, `InvalidFeatureStatusTransitionError`, and `HumanActorRequiredError`.
    - Enforced transition state invariants: only features with `PROPOSED` status can be transitioned.
    - Persisted immutable audit logs with `action: "APPROVED"` / `action: "REJECTED"` and actor type `HUMAN`.
  - **Hono REST API (`apps/api`):**
    - Created `featuresRouter` with `PATCH /api/features/:id/approve` and `PATCH /api/features/:id/reject` mounted in `apps/api/src/index.ts`.
    - Enforced Human-Only guard middleware: callers with `x-actor-type: AGENT` receive `403 Forbidden`.
  - **Web Client & State (`apps/web`):**
    - Added `featuresApi.approve` and `featuresApi.reject` to `apps/web/src/features/features/api.ts`.
    - Added `useApproveFeatureMutation` and `useRejectFeatureMutation` to `apps/web/src/features/features/queries.ts` with instant query invalidation of the project hub.
    - Updated `FeatureCard.tsx`: when in `PROPOSED` status, renders a dedicated bottom action strip with 1-click `[✓ Approve]` and `[✕ Reject]` buttons with 0ms tactile feedback and loading spinners.
    - Created `RejectFeatureModal.tsx` dialog for prompting the human operator for a rejection reason.
    - Added CSS design system styles `.feature-action-btn-approve`, `.feature-action-btn-reject`, and `.btn-danger` in `apps/web/src/styles/components.css`.
- **Verification & UAT:**
  - TypeScript typecheck (`npx tsc --noEmit`) verified 0 errors across all monorepo workspaces.
  - Live API testing verified:
    - Agent guard returned `403 Forbidden` when attempting approval/rejection with `x-actor-type: AGENT`.
    - `PATCH /api/features/1/approve` successfully transitioned `WM-4` ("Implement Session Cookie") from `PROPOSED` to `APPROVED`, moving it immediately into the Approved Kanban column.
    - Subsequent approval attempt properly failed with `Cannot approve Feature 1: only features with status 'PROPOSED' can be transitioned`.
    - `PATCH /api/features/2/reject` successfully transitioned `WM-5` to `REJECTED` and removed it from active Kanban columns.
    - Database audit query confirmed both actions logged with `actor: { type: "HUMAN" }` and timestamps.
  - Web UI live visual verification confirmed:
    - `WM-6` in Proposed column renders clean, non-wrapping `0/2 criteria` counter with dedicated full-width `[✓ Approve]` and `[✕ Reject]` action buttons.
    - `WM-4` in Approved column renders with standard card styling.
- **Handoff for Next Agent:**
  - **Epic 02 is now 100% complete!**
  - Next task is `FEAT-03-01` in [Epic 03: Task Discovery & Agent Claiming](file:///d:/Projects/Workmesh/docs/epics/epic-03-task-discovery-and-agent-claiming.md): Actionable Task Discovery Flow (`list_actionable_tasks` MCP tool matching Approved column).

---

### Session 09: Actionable Task Discovery Flow (`FEAT-03-01`)
- **Date / Timestamp:** 2026-10-22
- **Completed:** `FEAT-03-01` (Actionable Task Discovery Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Created `packages/shared/src/tasks.ts` defining `TASK_TYPES` (`"FEATURE" | "BUG"`), `PRIORITY_WEIGHTS` (numeric map `CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3`), and the unified `ActionableTask` domain model.
    - Defined `listActionableTasksQuerySchema` (with `z.coerce.number()`) for HTTP GET endpoints and `listActionableTasksInputSchema` with parameter descriptions for the MCP tool.
    - Exported from `@workmesh/shared` barrel.
  - **Database Domain Service (`@workmesh/db`):**
    - Created `packages/db/src/services/tasks.ts` implementing `listActionableTasks(projectKeyOrId, options)`.
    - Concurrently queries `features` (status `APPROVED` by default) and `bugs` (status `OPEN` by default) via `Promise.all` with selective short-circuiting when filtering by `ticketType`.
    - Projects parent epic title (`with: { epic: { columns: { id: true, title: true } } }`) without pulling heavy descriptions.
    - Deterministic composite sorting: primary sort by `PRIORITY_WEIGHTS` urgency and secondary FIFO tie-break by `ticketNumber ASC`.
    - Resilient project resolution supporting uppercase keys (`"WM"`), numeric string IDs (`"1"`), or automatic fallback to `WORKMESH_PROJECT_KEY` / single active project in DB.
    - Updated `packages/db/src/client.ts` to reliably locate `.env` via `import.meta.url` regardless of process `cwd`.
  - **Hono REST API (`apps/api`):**
    - Added `GET /api/projects/:key/actionable-tasks` in `apps/api/src/routes/projects.ts` with `zValidator("query", listActionableTasksQuerySchema)`.
  - **Web Client & Styling (`apps/web`):**
    - Added `projectsApi.listActionableTasks` in `apps/web/src/features/projects/api.ts`.
    - Added `projectKeys.actionableTasks` and `useActionableTasksQuery` in `apps/web/src/features/projects/queries.ts`.
    - Updated `FeatureCard.tsx` to render a subtle, high-contrast `Ready to Claim` badge in the header when a feature is in `APPROVED` status.
  - **MCP Server (`packages/mcp-server`):**
    - Created `packages/mcp-server/src/tools/tasks.ts` implementing `list_actionable_tasks`.
    - Formats output into clean, token-efficient Markdown for LLM consumption, displaying ticket keys, parent epic, acceptance criteria checklists, and `claim_task` instructions.
    - Mounted in `packages/mcp-server/src/tools/index.ts`.
    - Updated `packages/mcp-server/src/index.ts` to reliably locate `.env` via `import.meta.url`.
    - Configured MCP server in `~/.gemini/config/mcp_config.json` running via `cmd.exe /c npx tsx`.
- **Verification & UAT:**
  - Full monorepo TypeScript typecheck (`npx tsc --noEmit`) verified with 0 errors across all packages.
  - REST API endpoint verified live via curl: `GET http://localhost:3001/api/projects/WM/actionable-tasks` returning all 4 approved features with criteria checklists.
  - MCP tool live execution verified via `call_mcp_tool`:
    - `list_actionable_tasks({ projectKey: "WM" })` returned formatted Markdown with all 4 tickets.
    - `list_actionable_tasks({})` verified automatic default project detection.
    - `list_actionable_tasks({ projectKey: "WM", epicId: 1 })` verified epic-filtered discovery.
- **Handoff for Next Agent:**
  - Next task is `FEAT-03-02` in [Epic 03: Task Discovery & Agent Claiming](file:///d:/Projects/Workmesh/docs/epics/epic-03-task-discovery-and-agent-claiming.md): Task Claiming Flow (`claim_task` MCP tool + `PATCH /api/tasks/:id/claim`, transitioning tickets from `APPROVED` to `IN_PROGRESS`, logging `CLAIMED` in audit logs, and moving cards to the In Progress Kanban column).

---

### Session 10: Task Claiming Flow (`FEAT-03-02`)
- **Date / Timestamp:** 2026-10-22
- **Completed:** `FEAT-03-02` (Task Claiming Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Created `claimTaskBodySchema` for `PATCH /api/tasks/:id/claim` validating `{ ticketType: "FEATURE" | "BUG", agentId?: string, notes?: string }`.
    - Created `claimTaskInputSchema` for MCP tool `claim_task` requiring `ticketId` and `ticketType`.
  - **Database Domain Service (`@workmesh/db`):**
    - Added `TaskNotFoundError` and `InvalidTaskStatusTransitionError` domain error classes in `packages/db/src/services/tasks.ts`.
    - Implemented `claimTask(taskId, options, actor)`:
      - Validates initial status invariant: features must be `APPROVED`; bugs must be `OPEN`. Rejects double-claims or unapproved tickets.
      - Atomically updates status to `IN_PROGRESS` inside a `db.transaction(...)`.
      - Inserts immutable `activity_logs` audit record with `action: "CLAIMED"`, assigned agent name, and previous/next status.
      - Hydrates parent epic title and returns updated `ActionableTask`.
  - **Hono REST API (`apps/api`):**
    - Created `apps/api/src/routes/tasks.ts` with `PATCH /api/tasks/:id/claim`.
    - Mounted at `/api/tasks` in `apps/api/src/index.ts`.
    - Maps domain errors to HTTP 404 (not found) and HTTP 409 (conflict/invalid transition).
  - **Web Client & State (`apps/web`):**
    - Created `apps/web/src/features/tasks/api.ts` with `tasksApi.claim(taskId, input)`.
    - Created `apps/web/src/features/tasks/queries.ts` with `useClaimTaskMutation(projectKey)` coordinating multi-key cache invalidation across board, discovery, and list views.
    - Updated `FeatureCard.tsx` to render an interactive `[Claim Task]` action button on `APPROVED` cards with 0ms tactile feedback and loading spinner.
  - **MCP Server (`packages/mcp-server`):**
    - Implemented and registered `claim_task` tool in `packages/mcp-server/src/tools/tasks.ts`.
    - Formats output into clean, structured Markdown for agent confirmation.
- **Verification & UAT:**
  - Workspace typecheck (`npx tsc --noEmit`) verified with 0 errors across all packages.
  - Verified REST API endpoint with invalid task ID (returned 404 error).
  - Verified live MCP `claim_task` execution via `call_mcp_tool`:
    - Successfully claimed `WM-8` (Ticket ID: 5), shifting status to `IN_PROGRESS` with assigned agent `gemini-autonomous-agent`.
    - Attempted double-claim on `WM-8` via MCP and confirmed negative guard properly rejected with: `Cannot claim FEATURE 5: current status is 'IN_PROGRESS', but status 'APPROVED' is required.`
    - Verified `list_actionable_tasks` discovery pool automatically omitted `WM-8`.
    - Verified PostgreSQL `activity_logs` table recorded entry id 28 with `action: "CLAIMED"`, actor `gemini-autonomous-agent`, and timestamp.
- **Handoff for Next Agent:**
  - Next task is `FEAT-03-03` in [Epic 03: Task Discovery & Agent Claiming](file:///d:/Projects/Workmesh/docs/epics/epic-03-task-discovery-and-agent-claiming.md): Dedicated Feature Detail Page (`/projects/[key]/features/[featureKey]`) with two-column layout, criteria checklist toggles (`PATCH /api/features/:id/criteria`), and responsive breadcrumb navigation.

---

### Session 11: Dedicated Feature Detail Page & Criteria Management (`FEAT-03-03`)
- **Date / Timestamp:** 2026-10-30
- **Completed:** `FEAT-03-03` (Dedicated Feature Detail Page & Criteria Management)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Created `updateFeatureCriteriaBodySchema` and `UpdateFeatureCriteriaBodyInput` in `packages/shared/src/features.ts`, supporting index-based toggling (`{ criteriaIndex, completed }`) or bulk replacement (`{ criteria }`).
    - Created `FeatureDetailLinkedBug`, `FeatureDetailActivityLog`, and rich `FeatureDetail` models for the dedicated feature detail workspace.
  - **Database Domain Service (`@workmesh/db`):**
    - Implemented `getFeatureByKey(projectKey, ticketNumberOrKey)` in `packages/db/src/services/features.ts`, resolving feature by project prefix key and ticket number, hydrating parent project, parent epic, non-deleted linked bugs, and chronological audit activity logs.
    - Implemented `updateFeatureCriteria(featureId, input, actor)` in `packages/db/src/services/features.ts`, updating acceptance criteria JSON in a transaction and recording an `UPDATED` audit record in `activity_logs`.
  - **Hono REST API (`apps/api`):**
    - Added `GET /api/projects/:key/features/:featureKey` to `projectFeaturesRouter` in `apps/api/src/routes/features.ts`.
    - Added `PATCH /api/features/:id/criteria` with Zod validation to `featuresRouter` in `apps/api/src/routes/features.ts`, open to both human and agent actors.
    - Scoped human-only middleware strictly to `/:id/approve` and `/:id/reject`.
  - **Web Client & Page (`apps/web`):**
    - Added `featuresApi.getByKey` and `featuresApi.updateCriteria` in `apps/web/src/features/features/api.ts`.
    - Added `useFeatureDetailQuery` and `useUpdateFeatureCriteriaMutation` in `apps/web/src/features/features/queries.ts` with cross-cache invalidation (`featureKeys.detail`, `projectKeys.byKey`, and `featureKeys.byProject`).
    - Implemented dedicated route at `apps/web/src/app/projects/[key]/features/[featureKey]/page.tsx` adhering to the Minimal Design System:
      - Responsive breadcrumbs (`Projects / [Project Name] / Features / [Feature Key]`) and back navigation.
      - Main column: ticket key in monospace, priority badge with colored pip, status badge, epic reference, description, interactive acceptance criteria checklist with progress bar and counters, and linked bugs summary.
      - Right action rail: contextual state actions ([Approve], [Reject], [Claim Task]), properties card (parent epic, dates), and chronological activity audit timeline.
    - Updated `FeatureCard.tsx` on the project board to navigate to `/projects/${projectKey}/features/${ticketKey}` upon clicking.
- **Verification & UAT:**
  - TypeScript typecheck (`cmd /c npx tsc --noEmit`) verified with 0 errors across all monorepo packages.
  - Live REST API verification:
    - `GET /api/projects/WM/features/WM-4` returned 200 with full feature details, parent epic, linked bugs, and activity logs.
    - `PATCH /api/features/1/criteria` with `{ criteriaIndex: 0, completed: true }` persisted successfully and recorded an `UPDATED` entry in `activity_logs`.
    - Re-toggling `{ criteriaIndex: 0, completed: false }` verified immediate toggle persistence and audit logging.
  - Web UI verification:
    - Direct navigation `GET http://localhost:3000/projects/WM/features/WM-4` returned HTTP 200.
    - Project Kanban board `GET http://localhost:3000/projects/WM` returned HTTP 200.
    - Verified card click navigation, responsive breadcrumbs, and criteria counter tracking.
- **Handoff for Next Agent:**
  - **Epic 03 is now 100% complete!**
  - Next task is `FEAT-04-01` in [Epic 04: Deliverable Review & Human Sign-Off](file:///d:/Projects/Workmesh/docs/epics/epic-04-deliverable-review-and-human-signoff.md): Agent Submission & Ready for Test Flow (`submit_for_review` MCP tool + `PATCH /api/tasks/:id/submit-for-review`, shifting card to Ready for Test column and logging `SUBMITTED` in audit logs).

---

### Session 12: Agent Submission & Ready for Test Flow (`FEAT-04-01`)
- **Date / Timestamp:** 2026-10-31
- **Completed:** `FEAT-04-01` (Agent Submission & Ready for Test Flow)
- **What Was Implemented:**
  - **Shared Schemas (`@workmesh/shared`):**
    - Created `submitFeatureForReviewBodySchema` and `SubmitFeatureForReviewBodyInput` in `packages/shared/src/features.ts`, supporting index lists (`number[]`), boolean arrays (`boolean[]`), and optional reviewer notes (up to 5,000 characters).
    - Created `submitForReviewInputSchema` and `SubmitForReviewInput` for MCP tool argument parsing.
  - **Database Domain Service (`@workmesh/db`):**
    - Updated `InvalidFeatureStatusTransitionError` to support dynamic expected status preconditions.
    - Implemented `submitFeatureForReview(featureIdOrKey, input, actor)` in `packages/db/src/services/features.ts`:
      - Resolves features by numeric ID or string ticket key (e.g. `WM-4`).
      - Strictly guards state machine: requires current status to be `IN_PROGRESS`.
      - Updates acceptance criteria completion state (marks specific criteria or auto-completes all if omitted).
      - Atomically sets status to `READY_FOR_TEST` and writes a `SUBMITTED_FOR_REVIEW` audit record in `activity_logs` inside a single database transaction.
  - **Hono REST API (`apps/api`):**
    - Added `POST /api/features/:id/submit` in `apps/api/src/routes/features.ts`.
    - Integrated schema validation via `@hono/zod-validator`, actor detection from request headers (`x-actor-type`, `x-agent-id`), and proper HTTP status mappings (`404` Not Found, `409` Conflict for state violations).
  - **MCP Server (`packages/mcp-server`):**
    - Implemented and registered `submit_for_review` tool in `packages/mcp-server/src/tools/features.ts`.
    - Formats output into clean, structured Markdown for agent confirmation with verified criteria checklist and review instructions.
  - **Web UI (`apps/web`):**
    - Updated `FeatureCard.tsx` to render a high-contrast `Ready for Review` badge (`#9333EA`) and an `Awaiting Human Sign-Off` callout when in `READY_FOR_TEST`.
    - Updated `FeatureDetailPage` (`/projects/[key]/features/[featureKey]`) to render a contextual `Ready for Verification` action rail banner.
- **Verification & UAT:**
  - Workspace typecheck (`cmd /c npx tsc --noEmit`) verified with 0 errors across all monorepo packages.
  - Verified live MCP `submit_for_review` execution via `call_mcp_tool`:
    - Successfully submitted `WM-4` (`HttpOnly Session Cookie Authentication & CSRF Protection`), transitioning status to `READY_FOR_TEST` and marking 3/3 acceptance criteria verified.
  - Verified negative guard via live MCP `call_mcp_tool`:
    - Duplicate call properly rejected with: `Cannot submit_for_review Feature 9: current status is 'READY_FOR_TEST', but status 'IN_PROGRESS' is required.`
  - Verified live project metrics via MCP `get_project_context`:
    - `inProgressFeatures` transitioned to `0`, `readyForTestFeatures` transitioned to `1`.
- **Handoff for Next Agent:**
  - Next task is `FEAT-04-02` in [Epic 04: Deliverable Review & Human Sign-Off](file:///d:/Projects/Workmesh/docs/epics/epic-04-deliverable-review-and-human-signoff.md): Human QA Verification & Closure Flow (`PATCH /api/features/:id/close` with Human-only authorization guard, shifting ticket to `CLOSED`, and UI Action Rail [Verify & Close] button).






