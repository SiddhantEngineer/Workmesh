#!/usr/bin/env node

import * as dotenv from "dotenv";

// 1. Load environment variables (matching @workmesh/db and @workmesh/api convention)
dotenv.config({ path: "../../.env" });
dotenv.config();

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWorkmeshMcpServer } from "./server.js";

/**
 * Main executable entrypoint for stdio transport.
 */
async function main() {
  const server = createWorkmeshMcpServer();
  const transport = new StdioServerTransport();

  // Attach graceful termination signals
  const cleanup = async () => {
    console.error("Shutting down Workmesh MCP server...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await server.connect(transport);
  console.error("Workmesh MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting Workmesh MCP server:", err);
  process.exit(1);
});
