import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { count, eq, isNull, and, inArray } from "drizzle-orm";
import { db, epics } from "@workmesh/db";
import {
  ACTIVE_EPIC_STATUSES,
  getProjectContextInputSchema,
  type ProjectContextSummary,
  type ActiveEpicSummary,
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
        "Fetch high-level project context, active roadmap epics, and workspace metadata. " +
        "Optimized for LLM context limits: epics are returned as lightweight summaries without descriptions by default.",
      inputSchema: getProjectContextInputSchema,
    },
    async ({
      projectKey,
      projectId,
      epicLimit = 20,
      includeDescriptions = false,
    }) => {
      try {
        // 1. Guard against missing identifiers - fail explicitly instead of guessing
        if (!projectKey && !projectId) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "Missing project identifier: You must provide either 'projectKey' (e.g. 'WM') or 'projectId' to retrieve project context.",
              },
            ],
          };
        }

        // 2. Resolve target project in DB
        const project = await db.query.projects.findFirst({
          where: (projectsTable, { eq: eqCol, isNull: isNullCol, and: andCol }) =>
            andCol(
              projectKey
                ? eqCol(projectsTable.key, projectKey.toUpperCase())
                : eqCol(projectsTable.id, projectId!),
              isNullCol(projectsTable.deletedAt)
            ),
        });

        if (!project) {
          const identifierMsg = projectKey
            ? `with key "${projectKey}"`
            : `with ID "${projectId}"`;

          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Project not found: No active project exists ${identifierMsg}. Please create a project first or verify the key.`,
              },
            ],
          };
        }

        // 2. Concurrently execute DB-level counts and paginated active epics slice
        const [totalEpicsRes, activeEpicsRes, activeEpicsRows] = await Promise.all([
          // Total active project epics count in SQL
          db
            .select({ count: count() })
            .from(epics)
            .where(
              and(eq(epics.projectId, project.id), isNull(epics.deletedAt))
            ),

          // Active status epics count in SQL
          db
            .select({ count: count() })
            .from(epics)
            .where(
              and(
                eq(epics.projectId, project.id),
                isNull(epics.deletedAt),
                inArray(epics.status, ACTIVE_EPIC_STATUSES)
              )
            ),

          // Filtered & limited active epics in SQL (fetching epicLimit + 1 for pagination signal)
          db.query.epics.findMany({
            where: (epicsTable, { eq: eqCol, isNull: isNullCol, inArray: inArrayCol, and: andCol }) =>
              andCol(
                eqCol(epicsTable.projectId, project.id),
                isNullCol(epicsTable.deletedAt),
                inArrayCol(epicsTable.status, ACTIVE_EPIC_STATUSES)
              ),
            orderBy: (epicsTable, { asc }) => [asc(epicsTable.ticketNumber)],
            limit: epicLimit + 1,
          }),
        ]);

        const totalEpicsCount = totalEpicsRes[0]?.count ?? 0;
        const activeEpicsCount = activeEpicsRes[0]?.count ?? 0;

        // Check pagination indicator and slice to the requested limit
        const hasMoreEpics = activeEpicsRows.length > epicLimit;
        const paginatedActiveEpics = hasMoreEpics
          ? activeEpicsRows.slice(0, epicLimit)
          : activeEpicsRows;

        const formattedActiveEpics: ActiveEpicSummary[] = paginatedActiveEpics.map(
          (epic) => {
            const summary: ActiveEpicSummary = {
              id: epic.id,
              key: `${project.key}-${epic.ticketNumber}`,
              ticketNumber: epic.ticketNumber,
              title: epic.title,
              status: epic.status,
              priority: epic.priority,
            };

            if (includeDescriptions) {
              summary.description = epic.description;
            }

            return summary;
          }
        );

        const summary: ProjectContextSummary = {
          project: {
            id: project.id,
            name: project.name,
            key: project.key,
            description: project.description,
            nextTicketNumber: project.nextTicketNumber,
          },
          epicsCount: {
            total: totalEpicsCount,
            active: activeEpicsCount,
          },
          activeEpics: formattedActiveEpics,
          hasMoreEpics,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("[get_project_context] Error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to fetch project context: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
