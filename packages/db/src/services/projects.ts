import { count, eq, isNull, and, inArray, desc, asc, sql } from "drizzle-orm";
import { db } from "../client";
import { projects } from "../schema/projects";
import { epics } from "../schema/epics";
import { features } from "../schema/features";
import { bugs } from "../schema/bugs";
import { activityLogs } from "../schema/activity_logs";
import { recordActivity } from "./activity_logs";
import {
  ACTIVE_EPIC_STATUSES,
  type CreateProjectInput,
  type Project,
  type ProjectDetail,
  type GetProjectContextInput,
  type ProjectContextSummary,
  type ActiveEpicSummary,
} from "@workmesh/shared";
import type { ActivityActor } from "../schema/activity_logs";

export class DuplicateProjectKeyError extends Error {
  constructor(public readonly key: string) {
    super(`Project key '${key}' is already in use`);
    this.name = "DuplicateProjectKeyError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export class AmbiguousProjectError extends Error {
  constructor(public readonly availableKeys: string[]) {
    super(
      `Multiple active projects exist (${availableKeys.join(
        ", "
      )}). Please specify 'projectKey' or 'projectId', or set WORKMESH_PROJECT_KEY.`
    );
    this.name = "AmbiguousProjectError";
  }
}

/**
 * Creates a new project and records an audit log atomically in a single transaction.
 */
export async function createProject(
  input: CreateProjectInput,
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Project> {
  const upperKey = input.key.trim().toUpperCase();

  try {
    return await db.transaction(async (tx) => {
      const [newProject] = await tx
        .insert(projects)
        .values({
          name: input.name.trim(),
          key: upperKey,
          description: input.description?.trim() || null,
          themeId: input.themeId,
        })
        .returning();

      await recordActivity(tx, {
        projectId: newProject.id,
        entityType: "PROJECT",
        entityId: newProject.id,
        action: "CREATED",
        details: {
          actor,
          notes: `Project '${newProject.name}' (${newProject.key}) created`,
        },
      });

      return newProject as Project;
    });
  } catch (error: any) {
    // 23505 is PostgreSQL unique_violation error code
    if (
      error?.code === "23505" ||
      error?.message?.includes("projects_key_active_idx") ||
      error?.message?.includes("projects_key_unique")
    ) {
      throw new DuplicateProjectKeyError(upperKey);
    }
    throw error;
  }
}

/**
 * Deletes a specific project by uppercase key and cascades through its child entities.
 */
export async function deleteProjectByKey(key: string): Promise<Project> {
  const upperKey = key.trim().toUpperCase();

  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(eq(p.key, upperKey), isNull(p.deletedAt)),
  });

  if (!project) {
    throw new ProjectNotFoundError(`Project '${upperKey}' was not found.`);
  }

  return await db.transaction(async (tx) => {
    await tx.delete(activityLogs).where(eq(activityLogs.projectId, project.id));
    await tx.delete(bugs).where(eq(bugs.projectId, project.id));
    await tx.delete(features).where(eq(features.projectId, project.id));
    await tx.delete(epics).where(eq(epics.projectId, project.id));
    const [deleted] = await tx
      .delete(projects)
      .where(eq(projects.id, project.id))
      .returning();

    return deleted as Project;
  });
}

/**
 * Returns all active (non-deleted) projects, newest first.
 */
export async function listProjects(): Promise<Project[]> {
  const list = await db.query.projects.findMany({
    where: (p, { isNull }) => isNull(p.deletedAt),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  return list as Project[];
}

/**
 * Retrieves a single project by prefix key, including summaries of active epics and features.
 */
export async function getProjectByKey(key: string): Promise<ProjectDetail | null> {
  const upperKey = key.trim().toUpperCase();

  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(eq(p.key, upperKey), isNull(p.deletedAt)),
    with: {
      epics: {
        where: (e, { isNull }) => isNull(e.deletedAt),
        orderBy: (e, { asc }) => [asc(e.ticketNumber)],
        columns: {
          id: true,
          projectId: true,
          ticketNumber: true,
          title: true,
          status: true,
        },
      },
      features: {
        where: (f, { isNull }) => isNull(f.deletedAt),
        orderBy: (f, { asc }) => [asc(f.ticketNumber)],
        columns: {
          id: true,
          projectId: true,
          epicId: true,
          ticketNumber: true,
          title: true,
          priority: true,
          status: true,
          acceptanceCriteria: true,
        },
      },
    },
  });

  return (project as unknown as ProjectDetail) || null;
}

/**
 * Retrieves high-level project context for LLM agents or internal tools.
 * Supports smart default resolution, consolidated count queries, and telemetry stats.
 */
export async function getProjectContext(
  input: Partial<GetProjectContextInput> = {}
): Promise<ProjectContextSummary> {
  let targetKey = input.projectKey?.trim()?.toUpperCase();
  let targetId = input.projectId;

  // 1. Smart default resolution if neither identifier was supplied
  if (!targetKey && !targetId) {
    const envKey =
      process.env.WORKMESH_PROJECT_KEY || process.env.DEFAULT_PROJECT_KEY;

    if (envKey) {
      targetKey = envKey.trim().toUpperCase();
    } else {
      const activeProjects = await db.query.projects.findMany({
        where: (p, { isNull }) => isNull(p.deletedAt),
        columns: { id: true, key: true, name: true },
        limit: 10,
      });

      if (activeProjects.length === 0) {
        throw new ProjectNotFoundError(
          "No active projects found in Workmesh. Please create a project first."
        );
      } else if (activeProjects.length === 1) {
        targetId = activeProjects[0].id;
        targetKey = activeProjects[0].key;
      } else {
        const keys = activeProjects.map((p) => p.key);
        throw new AmbiguousProjectError(keys);
      }
    }
  }

  // 2. Query target project metadata
  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(
        targetKey ? eq(p.key, targetKey) : eq(p.id, targetId!),
        isNull(p.deletedAt)
      ),
  });

  if (!project) {
    const identifierMsg = targetKey
      ? `with key "${targetKey}"`
      : `with ID "${targetId}"`;
    throw new ProjectNotFoundError(`No active project exists ${identifierMsg}.`);
  }

  const epicLimit = input.epicLimit ?? 20;
  const includeDescriptions = input.includeDescriptions ?? false;

  // 3. Consolidated parallel queries: epics counts in 1 query, paginated slice, and telemetry stats
  const [epicCountsRes, activeEpicsRows, featureStatsRes, openBugsRes] =
    await Promise.all([
      // Consolidated total & active epics counts
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${inArray(
            epics.status,
            ACTIVE_EPIC_STATUSES
          )})`,
        })
        .from(epics)
        .where(and(eq(epics.projectId, project.id), isNull(epics.deletedAt))),

      // Filtered active epics slice with epicLimit + 1 for hasMore signal
      db.query.epics.findMany({
        where: (e, { and, eq, isNull, inArray: inArr }) =>
          and(
            eq(e.projectId, project.id),
            isNull(e.deletedAt),
            inArr(e.status, ACTIVE_EPIC_STATUSES)
          ),
        orderBy: (e, { asc }) => [asc(e.ticketNumber)],
        limit: epicLimit + 1,
      }),

      // Telemetry stats for features breakdown
      db
        .select({
          total: count(),
          proposed: sql<number>`count(*) filter (where ${eq(
            features.status,
            "PROPOSED"
          )})`,
          approved: sql<number>`count(*) filter (where ${eq(
            features.status,
            "APPROVED"
          )})`,
          inProgress: sql<number>`count(*) filter (where ${eq(
            features.status,
            "IN_PROGRESS"
          )})`,
          readyForTest: sql<number>`count(*) filter (where ${eq(
            features.status,
            "READY_FOR_TEST"
          )})`,
          closed: sql<number>`count(*) filter (where ${eq(
            features.status,
            "CLOSED"
          )})`,
        })
        .from(features)
        .where(
          and(eq(features.projectId, project.id), isNull(features.deletedAt))
        ),

      // Open bugs count
      db
        .select({
          openBugs: count(),
        })
        .from(bugs)
        .where(
          and(
            eq(bugs.projectId, project.id),
            isNull(bugs.deletedAt),
            inArray(bugs.status, ["OPEN", "IN_PROGRESS"])
          )
        ),
    ]);

  const totalEpicsCount = Number(epicCountsRes[0]?.total ?? 0);
  const activeEpicsCount = Number(epicCountsRes[0]?.active ?? 0);

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

  const featureStats = featureStatsRes[0];
  const openBugsCount = Number(openBugsRes[0]?.openBugs ?? 0);

  return {
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
    stats: {
      totalFeatures: Number(featureStats?.total ?? 0),
      proposedFeatures: Number(featureStats?.proposed ?? 0),
      approvedFeatures: Number(featureStats?.approved ?? 0),
      inProgressFeatures: Number(featureStats?.inProgress ?? 0),
      readyForTestFeatures: Number(featureStats?.readyForTest ?? 0),
      closedFeatures: Number(featureStats?.closed ?? 0),
      openBugs: openBugsCount,
    },
  };
}
