#!/usr/bin/env node

import * as dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// 1. Load environment variables reliably regardless of process.cwd()
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const possibleEnvPaths = [
  path.resolve(currentDir, "../../../.env"),
  path.resolve(currentDir, "../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
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
