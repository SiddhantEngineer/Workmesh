import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createFeature,
  EpicNotFoundError,
  EpicProjectMismatchError,
  ProjectNotFoundError,
} from "@workmesh/db";
import { createFeatureInputSchema } from "@workmesh/shared";

/**
 * Registers feature-related MCP tools with the server.
 */
export function registerFeatureTools(server: McpServer): void {
  server.registerTool(
    "create_feature",
    {
      title: "Create Feature",
      description:
        "Stage a new actionable Feature under an Epic with a verifiable acceptance criteria checklist. " +
        "The newly created Feature starts in PROPOSED status and receives an atomic project-scoped ticket key (e.g. WM-2). " +
        "Acceptance criteria must contain at least one verifiable checklist item for testing and closure.",
      inputSchema: createFeatureInputSchema,
    },
    async (args) => {
      try {
        const feature = await createFeature(args, {
          type: "AGENT",
          name: "mcp-agent",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Feature '${feature.title}' (${feature.key}) created successfully in PROPOSED status.`,
                  feature,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (
          error instanceof EpicNotFoundError ||
          error instanceof EpicProjectMismatchError ||
          error instanceof ProjectNotFoundError
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

        console.error("[create_feature] Unexpected error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to create feature: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
