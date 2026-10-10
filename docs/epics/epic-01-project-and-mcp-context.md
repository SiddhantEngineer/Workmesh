# Epic 01: Project Foundation & MCP Context

**Status:** IN_PROGRESS  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ Hono API $\rightarrow$ MCP Server $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic establishes the foundational vertical slice of Workmesh: multi-project awareness, navigation, and context sharing. It allows humans to view project workspaces at `/`, click into a dedicated Project Hub at `/projects/[key]` to see project details and features, and enables external AI agents to bootstrap their awareness using the `get_project_context` MCP tool.

---

## Features

### FEAT-01-01: Projects Directory & Workspace Creation (`/`)
- **ID:** `FEAT-01-01`
- **Priority:** `HIGH`
- **Status:** `DONE`
- **User Story:**  
  *As a human engineering manager, I want to view all projects on a directory dashboard and create new ones with unique prefixes, so that I can organize workspaces cleanly.*
- **Scope & Description:**
  - Database table `projects` with `id`, `name`, `key` (prefix), and `description`.
  - Shared Zod validation schemas (`createProjectSchema`, `projectResponseSchema`).
  - Hono REST routes: `GET /api/projects` and `POST /api/projects`.
  - Next.js Web UI: `/` (Directory Dashboard) with `ProjectCard`, `ProjectList`, Top-Nav, and `CreateProjectModal`.
- **Acceptance Criteria Checklist:**
  - [x] Project schema defined in `@workmesh/db` with unique uppercase key constraint.
  - [x] Shared validation schemas exported in `@workmesh/shared`.
  - [x] Hono API endpoints return project lists and validate duplicate keys.
  - [x] Web UI renders Top-Nav and project card grid.
  - [x] `+ New Project` modal opens, validates input, submits, and adds project to the directory.
- **Manual Verification via UI (UAT):**
  1. Open `http://localhost:3000` in browser.
  2. Verify dashboard displays project cards with keys and ticket counts.
  3. Click "+ New Project" button in top-nav or empty state.
  4. Fill out project name (e.g. `Alpha Engine`), prefix key (e.g. `AE`), and description.
  5. Click "Create Project" and verify modal closes and new project card appears in the grid.

---

### FEAT-01-02: Project Hub & Details Route (`/projects/[key]`)
- **ID:** `FEAT-01-02`
- **Priority:** `CRITICAL`
- **Status:** `DONE`
- **User Story:**  
  *As an engineer or manager, when I click on a project card, I want to be redirected to `/projects/[key]` (Project Hub) showing project metadata, roadmap/epic progress, and the list of features/kanban board, so that I have a dedicated home for that project.*
- **Scope & Description:**
  - Route: `/projects/[key]/page.tsx`.
  - Hono API endpoint: `GET /api/projects/:key` (retrieving project by uppercase key prefix along with its epics and features).
  - Web UI:
    - Project Header: Project Title, Key badge (`WM`), description, ticket counter.
    - Breadcrumbs: Dedicated in-page `<Breadcrumbs />` component (`Projects / [Project Name]`).
    - View Switcher: Toggle between **Kanban Board** (5 lifecycle columns) and **Features List** view.
    - Epics Filter Bar: Conditional roadmap skeleton rendered when active epics exist.
    - Empty state when no features exist yet, with a trigger button for "+ Propose Feature".
- **Acceptance Criteria Checklist:**
  - [x] API endpoint `GET /api/projects/:key` returns project by key with 404 handling if not found.
  - [x] Clicking any `ProjectCard` on `/` navigates to `/projects/[key]`.
  - [x] Direct URL navigation to `/projects/[key]` loads the project header and data.
  - [x] Breadcrumb allows clicking "Projects" to return back to `/`.
  - [x] Renders the layout skeleton for Epics filter tabs and Kanban / List views.
- **Manual Verification via UI (UAT):**
  - **Assumptions:**
    - Assumes project `Workmesh` with prefix key `WM` exists in the database (or was created on the `/` directory dashboard).
  1. From `http://localhost:3000`, click on the "Workmesh" (`WM`) project card.
  2. Verify browser URL immediately redirects to `http://localhost:3000/projects/WM`.
  3. Verify project header displays "Workmesh", key tag `WM`, and description.
  4. Verify breadcrumbs display `Projects / Workmesh`.
  5. Click "Projects" in the breadcrumbs and confirm seamless navigation back to `/`.

---

### FEAT-01-03: MCP Server Initialization & `get_project_context` Tool
- **ID:** `FEAT-01-03`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent connecting via MCP, I want to call `get_project_context`, so that I immediately receive the active project's key prefix, goals, and high-level roadmap before proposing or claiming tasks.*
- **Scope & Description:**
  - Initialize `@workmesh/mcp-server` package with `@modelcontextprotocol/sdk` supporting stdio transport.
  - Implement `get_project_context` tool accepting optional `projectKey` or `projectId`.
  - Query DB or API client to retrieve project name, key, description, and list of epics.
  - Return clean JSON formatted summary for the agent prompt context.
- **Acceptance Criteria Checklist:**
  - [ ] `@workmesh/mcp-server` configured with TypeScript build and binary entrypoint.
  - [ ] Tool `get_project_context` registered with Zod input schema (`projectKey?: string`, `projectId?: number`).
  - [ ] Handles missing project gracefully with informative error messages.
  - [ ] Returns project details along with count and titles of active Epics.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000/projects/WM` and confirm project `Workmesh` (`WM`) is visible.
  2. Run the MCP server via stdio in terminal or configure inside MCP Inspector (`npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js`).
  3. Execute `get_project_context` with `{ projectKey: "WM" }`.
  4. Verify tool output contains project title, description, and key prefix matching the UI.
  5. Verify that running without arguments resolves default/active project correctly.
