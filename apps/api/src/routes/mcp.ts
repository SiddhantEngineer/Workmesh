import { Hono } from "hono";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createWorkmeshMcpServer } from "@workmesh/mcp-server";
import crypto from "node:crypto";

export const mcpRouter = new Hono();

// Active multi-user sessions for streaming/stateful connections
interface SessionEntry {
  transport: WebStandardStreamableHTTPServerTransport;
  lastActive: number;
}

const sessions = new Map<string, SessionEntry>();

// Clean up stale sessions periodically (every 10 minutes, timeout after 1 hour)
const SESSION_TTL_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of sessions.entries()) {
    if (now - entry.lastActive > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000).unref();

mcpRouter.all("/*", async (c) => {
  const req = c.req.raw;
  const sessionIdHeader = req.headers.get("mcp-session-id");

  // 1. Existing stateful session
  if (sessionIdHeader && sessions.has(sessionIdHeader)) {
    const entry = sessions.get(sessionIdHeader)!;
    entry.lastActive = Date.now();
    return entry.transport.handleRequest(req);
  }

  // 2. New stateful connection or stateless request
  const acceptHeader = req.headers.get("accept");
  const isSse = acceptHeader?.includes("text/event-stream");

  if (isSse || req.method === "POST") {
    // Generate unique session for this user/agent
    const sessionId = sessionIdHeader || crypto.randomUUID();
    const server = createWorkmeshMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      enableJsonResponse: true,
      onsessionclosed: (closedId) => {
        sessions.delete(closedId);
      },
    });

    await server.connect(transport);
    sessions.set(sessionId, {
      transport,
      lastActive: Date.now(),
    });

    return transport.handleRequest(req);
  }

  // Fallback for unsupported methods
  return c.text("Workmesh Remote MCP Endpoint. Use an MCP client to connect via Streamable HTTP or SSE.", 200);
});
