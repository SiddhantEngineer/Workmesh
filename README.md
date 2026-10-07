# Workmesh

Agent-First Ticket Management System connecting AI Agents via Model Context Protocol (MCP) and human users via a modern web interface.

## Monorepo Structure

```text
workmesh/
├── apps/
│   ├── web/           # Next.js frontend application
│   └── api/           # Hono backend API & SSE server
├── packages/
│   ├── shared/        # Shared Zod schemas, types, and domain models
│   ├── db/            # PostgreSQL connection and Drizzle ORM schema
│   └── mcp-server/    # Model Context Protocol (MCP) server for agents
└── docs/              # Project and architecture specifications
```

## Getting Started

See [docs/tech-stack-spec.md](docs/tech-stack-spec.md) for detailed architecture and tech stack choices.
