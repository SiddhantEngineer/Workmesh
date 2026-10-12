import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getProjectContext,
  ProjectNotFoundError,
  AmbiguousProjectError,
} from "@workmesh/db";
import { getProjectContextInputSchema } from "@workmesh/shared";

/**
 * Registers project-related MCP tools with the server.
 */
export function registerProjectTools(server: McpServer): void {
  server.registerTool(
    "get_project_context",
    {
      title: "Get Project Context",
      description:
        "Fetch high-level project context, active roadmap epics, feature/bug telemetry stats, and workspace metadata. " +
        "Optimized for LLM context limits: epics are returned as lightweight summaries without descriptions by default. " +
        "If run without arguments, automatically resolves WORKMESH_PROJECT_KEY or auto-selects if only one project exists.",
      inputSchema: getProjectContextInputSchema,
    },
    async (args) => {
      try {
        const summary = await getProjectContext(args);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      } catch (error) {
        if (
          error instanceof ProjectNotFoundError ||
          error instanceof AmbiguousProjectError
        ) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: error.message,
              },
            ],
          };
        }

        console.error(
          "[get_project_context] Unexpected error executing tool:",
          error
        );
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to fetch project context: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
