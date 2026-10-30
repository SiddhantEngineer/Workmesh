import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProjectTools } from "./projects.js";
import { registerEpicTools } from "./epics.js";
import { registerFeatureTools } from "./features.js";
import { registerTaskTools } from "./tasks.js";

/**
 * Master registrar for all MCP tool modules across Workmesh domains.
 */
export function registerAllTools(server: McpServer): void {
  // Epic 01: Project Foundation & Context
  registerProjectTools(server);

  // Epic 02: Epic & Feature Creation and Human Approval
  registerEpicTools(server);
  registerFeatureTools(server);

  // Epic 03: Task Discovery & Agent Claiming
  registerTaskTools(server);

  // Future epics will mount their registrars here:
  // registerBugTools(server);     // Epic 05
}

export * from "./projects.js";
export * from "./epics.js";
export * from "./features.js";
export * from "./tasks.js";
