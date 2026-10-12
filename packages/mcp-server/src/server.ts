import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";

/**
 * Creates and configures the Workmesh MCP Server instance.
 */
export function createWorkmeshMcpServer(): McpServer {
  const server = new McpServer({
    name: "workmesh-mcp-server",
    version: "0.1.0",
  });

  // Register all tools across Workmesh domains
  registerAllTools(server);

  return server;
}
