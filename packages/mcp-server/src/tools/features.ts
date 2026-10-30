import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createFeature,
  submitFeatureForReview,
  EpicNotFoundError,
  EpicProjectMismatchError,
  ProjectNotFoundError,
  FeatureNotFoundError,
  InvalidFeatureStatusTransitionError,
} from "@workmesh/db";
import {
  createFeatureInputSchema,
  submitForReviewInputSchema,
  type Feature,
} from "@workmesh/shared";

/**
 * Formats the result of a submitted feature into structured Markdown for agent confirmation.
 */
function formatSubmittedFeatureMarkdown(
  feature: Feature,
  notes?: string,
  agentId?: string
): string {
  const lines: string[] = [
    `# Feature Submitted for Review: [${feature.key}] ${feature.title}`,
    `- **Status:** \`${feature.status}\` (Transitioned to READY_FOR_TEST)`,
    `- **Priority:** \`${feature.priority}\``,
    `- **Submitted By:** ${agentId || "autonomous-agent"}`,
  ];

  if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
    const completed = feature.acceptanceCriteria.filter((c) => c.completed).length;
    lines.push(
      `\n### Acceptance Criteria Checklist (${completed}/${feature.acceptanceCriteria.length} verified):`
    );
    feature.acceptanceCriteria.forEach((c) => {
      lines.push(`- [${c.completed ? "x" : " "}] ${c.text}`);
    });
  }

  if (notes && notes.trim().length > 0) {
    lines.push(`\n### Submission Notes:\n${notes.trim()}`);
  }

  lines.push("\n---");
  lines.push(
    "**Review Status:**\n" +
      "The card is now staged in the **Ready for Test** column on the Web UI Kanban board.\n" +
      "A human engineering manager / QA tester can now review the deliverables and perform final verification (`[Verify & Close]`)."
  );

  return lines.join("\n");
}

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

  server.registerTool(
    "submit_for_review",
    {
      title: "Submit Feature for Review",
      description:
        "Submits a feature currently in IN_PROGRESS to READY_FOR_TEST upon implementation completion. " +
        "Allows updating/completing acceptance criteria and supplying implementation summary notes. " +
        "Shifts the card to the Ready for Test column on the Web UI Kanban board for human QA verification.",
      inputSchema: submitForReviewInputSchema,
    },
    async (args) => {
      try {
        const feature = await submitFeatureForReview(
          args.featureId,
          {
            completedCriteria: args.completedCriteria,
            notes: args.notes,
          },
          {
            type: "AGENT",
            name: args.agentId?.trim() || "autonomous-agent",
          }
        );

        const markdown = formatSubmittedFeatureMarkdown(
          feature,
          args.notes,
          args.agentId
        );

        return {
          content: [
            {
              type: "text",
              text: markdown,
            },
          ],
        };
      } catch (error) {
        if (
          error instanceof FeatureNotFoundError ||
          error instanceof InvalidFeatureStatusTransitionError
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

        console.error("[submit_for_review] Unexpected error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to submit feature for review: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
