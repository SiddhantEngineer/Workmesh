import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProjectTools } from "./projects.js";

/**
 * Master registrar for all MCP tool modules across Workmesh domains.
 */
export function registerAllTools(server: McpServer): void {
  // Epic 01: Project Foundation & Context
  registerProjectTools(server);

  // Future epics will mount their registrars here:
  // registerEpicTools(server);    // Epic 02
  // registerTaskTools(server);    // Epic 03 / 04
  // registerBugTools(server);     // Epic 05
}

export * from "./projects.js";
