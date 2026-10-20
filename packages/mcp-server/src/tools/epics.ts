import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createEpic,
  ProjectNotFoundError,
  AmbiguousProjectError,
} from "@workmesh/db";
import { createEpicInputSchema } from "@workmesh/shared";

/**
 * Registers epic-related MCP tools with the server.
 */
export function registerEpicTools(server: McpServer): void {
  server.registerTool(
    "create_epic",
    {
      title: "Create Epic",
      description:
        "Stage a new Epic (high-level initiative or milestone) under a project. " +
        "The newly created Epic starts in PROPOSED status and receives an atomic project-scoped ticket key (e.g. WM-1). " +
        "If projectKey and projectId are omitted, automatically resolves WORKMESH_PROJECT_KEY or uses the single active project.",
      inputSchema: createEpicInputSchema,
    },
    async (args) => {
      try {
        const epic = await createEpic(args, {
          type: "AGENT",
          name: "mcp-agent",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Epic '${epic.title}' (${epic.key}) created successfully in PROPOSED status.`,
                  epic,
                },
                null,
                2
              ),
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

        console.error("[create_epic] Unexpected error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to create epic: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}

