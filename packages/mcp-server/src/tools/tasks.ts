import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listActionableTasks,
  claimTask,
  ProjectNotFoundError,
  AmbiguousProjectError,
  TaskNotFoundError,
  InvalidTaskStatusTransitionError,
} from "@workmesh/db";
import {
  listActionableTasksInputSchema,
  claimTaskInputSchema,
  type ActionableTask,
} from "@workmesh/shared";

/**
 * Formats a list of actionable tasks into clean, structured Markdown
 * optimized for AI agent consumption and context conservation.
 */
function formatActionableTasksMarkdown(tasks: ActionableTask[]): string {
  if (tasks.length === 0) {
    return (
      "### No Actionable Tasks Found\n\n" +
      "There are currently no tickets matching your criteria in the actionable pool.\n" +
      "Features must be in `APPROVED` status and bugs in `OPEN` status to be eligible for claiming.\n" +
      "If there are newly proposed features, human approval (`PATCH /api/features/:id/approve`) is required first."
    );
  }

  const projectKey = tasks[0]?.projectKey || "Workmesh";
  const lines: string[] = [
    `# Actionable Tasks for Project ${projectKey}`,
    `Found **${tasks.length}** actionable task(s) ready for execution (sorted by priority):\n`,
  ];

  tasks.forEach((task, idx) => {
    lines.push(
      `### ${idx + 1}. [${task.key}] ${task.title} (${task.ticketType} — ${task.priority})`
    );
    lines.push(`- **Ticket ID:** \`${task.id}\``);
    lines.push(`- **Status:** \`${task.status}\``);

    if (task.epicTitle) {
      lines.push(`- **Parent Epic:** ${task.epicTitle}${task.epicId ? ` (ID: ${task.epicId})` : ""}`);
    }

    if (task.ticketType === "FEATURE" && task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      const completed = task.acceptanceCriteria.filter((c) => c.completed).length;
      lines.push(`- **Acceptance Criteria (${completed}/${task.acceptanceCriteria.length} verified):**`);
      task.acceptanceCriteria.forEach((c) => {
        lines.push(`  - [${c.completed ? "x" : " "}] ${c.text}`);
      });
    }

    if (task.ticketType === "BUG" && task.reproductionSteps) {
      lines.push(`- **Reproduction Steps:**\n  ${task.reproductionSteps.replace(/\n/g, "\n  ")}`);
    }

    if (task.description && task.description.trim().length > 0) {
      lines.push(`- **Description:** ${task.description.trim()}`);
    }

    lines.push(""); // Blank line separator
  });

  lines.push("---");
  lines.push(
    "**Claiming Instructions:**\n" +
    "To assign a task to yourself and move it to `IN_PROGRESS`, invoke `claim_task` with:\n" +
    "- `ticketId`: The ticket's numeric ID\n" +
    "- `ticketType`: `\"FEATURE\"` or `\"BUG\"`"
  );

  return lines.join("\n");
}

/**
 * Formats the result of a claimed task into structured Markdown for agent confirmation.
 */
function formatClaimedTaskMarkdown(task: ActionableTask, agentId?: string): string {
  const lines: string[] = [
    `# Task Claimed Successfully: [${task.key}] ${task.title}`,
    `- **Ticket ID:** \`${task.id}\``,
    `- **Status:** \`${task.status}\` (Transitioned to IN_PROGRESS)`,
    `- **Ticket Type:** \`${task.ticketType}\``,
    `- **Priority:** \`${task.priority}\``,
    `- **Claimed By:** ${agentId || "autonomous-agent"}`,
  ];

  if (task.epicTitle) {
    lines.push(`- **Parent Epic:** ${task.epicTitle}${task.epicId ? ` (ID: ${task.epicId})` : ""}`);
  }

  if (task.ticketType === "FEATURE" && task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    lines.push("\n### Acceptance Criteria Checklist:");
    task.acceptanceCriteria.forEach((c) => {
      lines.push(`- [${c.completed ? "x" : " "}] ${c.text}`);
    });
  }

  if (task.ticketType === "BUG" && task.reproductionSteps) {
    lines.push(`\n### Reproduction Steps:\n${task.reproductionSteps}`);
  }

  if (task.description && task.description.trim().length > 0) {
    lines.push(`\n### Description:\n${task.description.trim()}`);
  }

  lines.push("\n---");
  lines.push(
    "**Next Steps:**\n" +
    "You are now the active assignee for this ticket. The Web UI Kanban board has shifted this card to **In Progress**.\n" +
    "Once you have developed the solution and verified all criteria, submit it for human review via `submit_for_review`."
  );

  return lines.join("\n");
}

/**
 * Registers task-related MCP tools with the server.
 */
export function registerTaskTools(server: McpServer): void {
  server.registerTool(
    "list_actionable_tasks",
    {
      title: "List Actionable Tasks",
      description:
        "Discovers all actionable tasks (human-approved features and open bugs) ready for autonomous development. " +
        "Tasks are returned sorted strictly by priority (CRITICAL -> HIGH -> MEDIUM -> LOW). " +
        "Includes ticket keys (e.g. WM-4), acceptance criteria checklists, parent epic titles, and claim instructions. " +
        "Supports optional filtering by status, epicId, or ticketType (FEATURE vs BUG). " +
        "If run without arguments, automatically resolves the active project from WORKMESH_PROJECT_KEY or database context.",
      inputSchema: listActionableTasksInputSchema,
    },
    async (args) => {
      try {
        const targetIdentifier = args.projectKey || args.projectId;

        const tasks = await listActionableTasks(targetIdentifier, {
          epicId: args.epicId,
          status: args.status,
          ticketType: args.ticketType,
        });

        const markdown = formatActionableTasksMarkdown(tasks);

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

        console.error("[list_actionable_tasks] Unexpected error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to list actionable tasks: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "claim_task",
    {
      title: "Claim Task",
      description:
        "Claims an approved Feature (status APPROVED) or open Bug (status OPEN) for active development. " +
        "Atomically shifts the ticket's status to IN_PROGRESS and records an audit log entry. " +
        "Prevents work duplication across autonomous agents by locking the ticket in the active development column.",
      inputSchema: claimTaskInputSchema,
    },
    async (args) => {
      try {
        const task = await claimTask(
          args.ticketId,
          {
            ticketType: args.ticketType,
            agentId: args.agentId,
            notes: args.notes,
          },
          {
            type: "AGENT",
            name: args.agentId?.trim() || "autonomous-agent",
          }
        );

        const markdown = formatClaimedTaskMarkdown(task, args.agentId);

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
          error instanceof TaskNotFoundError ||
          error instanceof InvalidTaskStatusTransitionError
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

        console.error("[claim_task] Unexpected error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to claim task: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}

