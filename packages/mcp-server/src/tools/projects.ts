import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getProjectContext,
  createProject,
  deleteProjectByKey,
  ProjectNotFoundError,
  AmbiguousProjectError,
  DuplicateProjectKeyError,
} from "@workmesh/db";
import {
  getProjectContextInputSchema,
  createProjectMcpInputSchema,
  deleteProjectMcpInputSchema,
} from "@workmesh/shared";

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

  server.registerTool(
    "create_project",
    {
      title: "Create Project",
      description:
        "Create a new top-level project workspace. Assigns a unique key prefix (e.g. 'APEX') for ticket numbering, " +
        "initializes next ticket counter, and sets up design theme tokens.",
      inputSchema: createProjectMcpInputSchema,
    },
    async (args) => {
      try {
        const project = await createProject(
          {
            name: args.name,
            key: args.key,
            description: args.description,
            themeId: args.themeId ?? 1,
          },
          { type: "AGENT", name: "mcp-agent" }
        );

        return {
          content: [
            {
              type: "text",
              text:
                `# Project Created Successfully: [${project.key}] ${project.name}\n` +
                `- **Project ID:** \`${project.id}\`\n` +
                `- **Prefix Key:** \`${project.key}\`\n` +
                `- **Theme ID:** \`${project.themeId}\`\n` +
                (project.description ? `- **Description:** ${project.description}\n` : "") +
                `\nTo add epics or discover tasks, call \`create_epic\` or \`get_project_context\` with projectKey: "${project.key}".`,
            },
          ],
        };
      } catch (error) {
        if (error instanceof DuplicateProjectKeyError) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Conflict: ${error.message}. Please select a different prefix key.`,
              },
            ],
          };
        }

        console.error("[create_project] Error creating project:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to create project: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "delete_project",
    {
      title: "Delete Project",
      description:
        "Permanently delete a project workspace and cascade-delete all associated child epics, features, bugs, and audit activity logs by project key prefix.",
      inputSchema: deleteProjectMcpInputSchema,
    },
    async (args) => {
      try {
        const deleted = await deleteProjectByKey(args.projectKey);

        return {
          content: [
            {
              type: "text",
              text:
                `# Project Deleted Successfully: [${deleted.key}] ${deleted.name}\n` +
                `- **Project ID:** \`${deleted.id}\`\n` +
                `- **Key:** \`${deleted.key}\`\n` +
                `All associated epics, features, bugs, and activity logs have been cascade-deleted.`,
            },
          ],
        };
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Not Found: ${error.message}`,
              },
            ],
          };
        }

        console.error("[delete_project] Error deleting project:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to delete project: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
