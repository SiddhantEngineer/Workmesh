# Epic 01: Project Foundation & MCP Context

**Status:** IN_PROGRESS  
**Type:** Vertical Slice  
**Architecture:** Shared Schemas $\rightarrow$ Hono API $\rightarrow$ MCP Server $\rightarrow$ Next.js Web UI  

---

## Executive Summary
This epic establishes the foundational vertical slice of Workmesh: multi-project awareness and context sharing. It allows humans to switch and configure projects via the Web UI, and external AI agents (via Cursor, Claude Code, or Antigravity) to bootstrap their awareness using the `get_project_context` MCP tool.

---

## Features

### FEAT-01-01: Project Management & Workspace Switcher
- **ID:** `FEAT-01-01`
- **Priority:** `HIGH`
- **Status:** `DONE`
- **User Story:**  
  *As a human engineering manager, I want to create and select projects with unique ticket prefixes (e.g., `WM`), so that my team and AI agents operate within isolated project namespaces.*
- **Scope & Description:**
  - Database table `projects` with `id`, `name`, `key` (prefix), and `description`.
  - Shared Zod validation schemas (`createProjectSchema`, `projectResponseSchema`).
  - Hono REST routes: `GET /api/projects` and `POST /api/projects`.
  - Web UI Top-Nav with Project Switcher dropdown and "+ New Project" modal conforming to the Minimal Design System.
- **Acceptance Criteria Checklist:**
  - [x] Project schema defined in `@workmesh/db` with unique uppercase key constraint.
  - [x] Shared validation schemas exported in `@workmesh/shared`.
  - [x] Hono API endpoints return project lists and validate duplicate keys.
  - [x] Web UI renders Top-Nav with active project name and key badge.
  - [x] "+ New Project" modal opens, validates input, submits, and switches active project.
- **Manual Verification via UI (UAT):**
  1. Open `http://localhost:3000` in browser.
  2. Verify top-nav displays project dropdown with current projects.
  3. Click "+ New Project" button in dropdown or header.
  4. Fill out project name (e.g. `Alpha Engine`), prefix key (e.g. `AE`), and description.
  5. Click "Create Project" and verify modal closes, new project appears in dropdown, and becomes the active selection.

---

### FEAT-01-02: MCP Server Initialization & `get_project_context` Tool
- **ID:** `FEAT-01-02`
- **Priority:** `CRITICAL`
- **Status:** `TODO`
- **User Story:**  
  *As an AI coding agent connecting via MCP, I want to call `get_project_context`, so that I immediately receive the active project's key prefix, goals, and high-level roadmap before proposing or claiming tasks.*
- **Scope & Description:**
  - Initialize `@workmesh/mcp-server` package with `@modelcontextprotocol/sdk` supporting stdio transport.
  - Implement `get_project_context` tool accepting optional `projectId` (or defaulting to active project).
  - Query DB or API client to retrieve project name, key, description, and list of epics.
  - Return clean JSON formatted summary for the agent prompt context.
- **Acceptance Criteria Checklist:**
  - [ ] `@workmesh/mcp-server` configured with TypeScript build and binary entrypoint.
  - [ ] Tool `get_project_context` registered with Zod input schema (`projectId?: number`).
  - [ ] Handles missing project gracefully with informative error messages.
  - [ ] Returns project details along with count and titles of active Epics.
- **Manual Verification via UI (UAT):**
  1. Open Web UI at `http://localhost:3000` and confirm project `Workmesh` (`WM`) is visible.
  2. Run the MCP server via stdio in terminal or configure inside MCP Inspector (`npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js`).
  3. Execute `get_project_context` with `{ projectId: 1 }`.
  4. Verify tool output contains project title, description, and key prefix matching the UI.
  5. Verify that running without arguments resolves the active project correctly.
