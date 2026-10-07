# Tech Stack Specification: Agent-First Ticket Management System

## 1. Executive Overview

This project is an **Agent-First Ticket Management System** designed for human-AI collaborative software development. It bridges autonomous AI agents and human stakeholders using the **Model Context Protocol (MCP)** and a modern real-time web interface.

### Core Workflow Lifecycle
1. **Decomposition:** AI agents decompose high-level initiatives into **Epics** and **Features**.
2. **Human-in-the-Loop Approval:** Proposed items enter a `PROPOSED` state and require human approval via the Web UI before work begins.
3. **Autonomous Execution:** Once marked `APPROVED`, agents claim tasks and transition them to `IN_PROGRESS`.
4. **Human Verification & QA:** Completed features move to `READY_FOR_TEST`. Users test deliverables and file linked `BUG` tickets if issues arise.
5. **Resolution & Closure:** Agents address reported bugs; users verify fixes and transition features to `CLOSED`.

---

## 2. Technology Stack Breakdown

| Layer | Technology | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router) | Responsive, high-performance UI (dashboard, kanban board, real-time ticket stream, review/approval panels). |
| **API Server** | [Hono](https://hono.dev/) | Ultra-fast, lightweight web framework handling REST endpoints, RPC, and SSE streaming. |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational store for Epics, Features, Bugs, Audit Trails, and Agent Execution logs. |
| **ORM & Migrations**| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL schema definitions, light runtime overhead, and automated migration management. |
| **Validation & Types** | [Zod](https://zod.dev/) | Single source of truth for validation across MCP tool arguments, Hono request schemas, and form inputs. |
| **Agent Protocol** | [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol) | Official TypeScript SDK implementing MCP standards to expose tools and resources to AI agents. |
| **Real-time Sync** | **Server-Sent Events (SSE)** | Unidirectional streaming from server to browser for live ticket updates, status changes, and agent activity. |
