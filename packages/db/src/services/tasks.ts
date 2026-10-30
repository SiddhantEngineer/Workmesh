import { eq, and, isNull } from "drizzle-orm";
import { db } from "../client";
import { features } from "../schema/features";
import { bugs } from "../schema/bugs";
import { recordActivity } from "./activity_logs";
import { ProjectNotFoundError, AmbiguousProjectError } from "./projects";
import {
  type ActionableTask,
  type Priority,
  type FeatureStatus,
  type BugStatus,
  type AcceptanceCriterion,
  type TaskType,
  PRIORITY_WEIGHTS,
} from "@workmesh/shared";
import type { ActivityActor } from "../schema/activity_logs";

export class TaskNotFoundError extends Error {
  constructor(
    public readonly ticketType: TaskType,
    public readonly taskId: number
  ) {
    super(`${ticketType} with ID ${taskId} was not found or has been deleted.`);
    this.name = "TaskNotFoundError";
  }
}

export class InvalidTaskStatusTransitionError extends Error {
  constructor(
    public readonly ticketType: TaskType,
    public readonly taskId: number,
    public readonly currentStatus: string,
    public readonly expectedStatus: string,
    public readonly attemptedAction: string
  ) {
    super(
      `Cannot ${attemptedAction.toLowerCase()} ${ticketType} ${taskId}: current status is '${currentStatus}', but status '${expectedStatus}' is required.`
    );
    this.name = "InvalidTaskStatusTransitionError";
  }
}

export interface ListActionableTasksOptions {
  epicId?: number;
  status?: string;
  ticketType?: "FEATURE" | "BUG" | "ALL";
}

/**
 * Retrieves actionable tasks (approved features and open bugs) ready for execution.
 * Aggregates both entities, normalizes them into ActionableTask domain models,
 * and sorts them deterministically by urgency (CRITICAL -> HIGH -> MEDIUM -> LOW).
 */
export async function listActionableTasks(
  projectKeyOrId?: string | number,
  options: ListActionableTasksOptions = {}
): Promise<ActionableTask[]> {
  let rawKey =
    typeof projectKeyOrId === "string" ? projectKeyOrId.trim().toUpperCase() : undefined;
  let numId =
    typeof projectKeyOrId === "number" ? projectKeyOrId : undefined;

  if (rawKey && /^\d+$/.test(rawKey)) {
    numId = Number(rawKey);
    rawKey = undefined;
  }

  // 1. Smart default resolution if identifier was omitted
  if (!rawKey && !numId) {
    const envKey =
      process.env.WORKMESH_PROJECT_KEY || process.env.DEFAULT_PROJECT_KEY;

    if (envKey) {
      rawKey = envKey.trim().toUpperCase();
    } else {
      const activeProjects = await db.query.projects.findMany({
        where: (p, { isNull }) => isNull(p.deletedAt),
        columns: { id: true, key: true },
        limit: 10,
      });

      if (activeProjects.length === 0) {
        throw new ProjectNotFoundError(
          "No active projects found in Workmesh. Please create a project first."
        );
      } else if (activeProjects.length === 1) {
        numId = activeProjects[0].id;
        rawKey = activeProjects[0].key;
      } else {
        const keys = activeProjects.map((p) => p.key);
        throw new AmbiguousProjectError(keys);
      }
    }
  }

  // 2. Resolve project
  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(
        rawKey ? eq(p.key, rawKey) : eq(p.id, numId!),
        isNull(p.deletedAt)
      ),
  });

  if (!project) {
    throw new ProjectNotFoundError(
      `No active project exists with identifier "${projectKeyOrId}".`
    );
  }

  const ticketType = options.ticketType ?? "ALL";
  const shouldFetchFeatures = ticketType === "ALL" || ticketType === "FEATURE";
  const shouldFetchBugs = ticketType === "ALL" || ticketType === "BUG";

  // 2. Fetch features and bugs concurrently
  const [featuresList, bugsList] = await Promise.all([
    shouldFetchFeatures
      ? db.query.features.findMany({
          where: (f, { and, eq, isNull }) =>
            and(
              eq(f.projectId, project.id),
              isNull(f.deletedAt),
              options.status
                ? eq(f.status, options.status as FeatureStatus)
                : eq(f.status, "APPROVED"),
              options.epicId ? eq(f.epicId, options.epicId) : undefined
            ),
          with: {
            epic: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    shouldFetchBugs
      ? db.query.bugs.findMany({
          where: (b, { and, eq, isNull }) =>
            and(
              eq(b.projectId, project.id),
              isNull(b.deletedAt),
              options.status
                ? eq(b.status, options.status as BugStatus)
                : eq(b.status, "OPEN"),
              options.epicId ? eq(b.epicId, options.epicId) : undefined
            ),
          with: {
            epic: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // 3. Normalize features into ActionableTask
  const normalizedFeatures: ActionableTask[] = featuresList.map((f) => ({
    id: f.id,
    key: `${project.key}-${f.ticketNumber}`,
    ticketNumber: f.ticketNumber,
    ticketType: "FEATURE",
    title: f.title,
    description: f.description,
    priority: f.priority as Priority,
    status: f.status,
    projectId: project.id,
    projectKey: project.key,
    epicId: f.epicId,
    epicTitle: f.epic?.title ?? null,
    featureId: null,
    acceptanceCriteria: (f.acceptanceCriteria as AcceptanceCriterion[]) ?? [],
    reproductionSteps: null,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  }));

  // 4. Normalize bugs into ActionableTask
  const normalizedBugs: ActionableTask[] = bugsList.map((b) => ({
    id: b.id,
    key: `${project.key}-${b.ticketNumber}`,
    ticketNumber: b.ticketNumber,
    ticketType: "BUG",
    title: b.title,
    description: b.description,
    priority: b.priority as Priority,
    status: b.status,
    projectId: project.id,
    projectKey: project.key,
    epicId: b.epicId,
    epicTitle: b.epic?.title ?? null,
    featureId: b.featureId,
    acceptanceCriteria: undefined,
    reproductionSteps: b.reproductionSteps ?? null,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));

  // 5. Aggregate and sort by priority weight, then by ticket number
  const allTasks = [...normalizedFeatures, ...normalizedBugs];

  allTasks.sort((a, b) => {
    const weightDiff =
      (PRIORITY_WEIGHTS[a.priority] ?? 99) -
      (PRIORITY_WEIGHTS[b.priority] ?? 99);
    if (weightDiff !== 0) {
      return weightDiff;
    }
    return a.ticketNumber - b.ticketNumber;
  });

  return allTasks;
}

export interface ClaimTaskOptions {
  ticketType: TaskType;
  agentId?: string;
  notes?: string;
}

/**
 * Claims an actionable ticket (moves Feature from APPROVED -> IN_PROGRESS or Bug from OPEN -> IN_PROGRESS).
 * Enforces strict initial status invariants, executes inside an atomic database transaction,
 * records an immutable audit log, and returns the updated ActionableTask.
 */
export async function claimTask(
  taskId: number,
  options: ClaimTaskOptions,
  actor?: ActivityActor
): Promise<ActionableTask> {
  const effectiveActor: ActivityActor = actor || {
    type: "AGENT",
    name: options.agentId?.trim() || "autonomous-agent",
  };

  if (options.ticketType === "FEATURE") {
    const existing = await db.query.features.findFirst({
      where: (f, { and, eq, isNull }) =>
        and(eq(f.id, taskId), isNull(f.deletedAt)),
      with: {
        project: true,
        epic: { columns: { id: true, title: true } },
      },
    });

    if (!existing) {
      throw new TaskNotFoundError("FEATURE", taskId);
    }

    if (existing.status !== "APPROVED") {
      throw new InvalidTaskStatusTransitionError(
        "FEATURE",
        taskId,
        existing.status,
        "APPROVED",
        "CLAIM"
      );
    }

    const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;
    const claimNotes =
      options.notes?.trim() ||
      (options.agentId
        ? `Feature claimed by agent '${options.agentId}' for active development.`
        : `Feature claimed for active development.`);

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(features)
        .set({
          status: "IN_PROGRESS",
          updatedAt: new Date(),
        })
        .where(and(eq(features.id, taskId), isNull(features.deletedAt)))
        .returning();

      await recordActivity(tx, {
        projectId: existing.projectId,
        entityType: "FEATURE",
        entityId: existing.id,
        action: "CLAIMED",
        details: {
          actor: effectiveActor,
          previousStatus: "APPROVED",
          nextStatus: "IN_PROGRESS",
          notes: claimNotes,
        },
      });

      return {
        id: updated.id,
        key: ticketKey,
        ticketNumber: updated.ticketNumber,
        ticketType: "FEATURE",
        title: updated.title,
        description: updated.description,
        priority: updated.priority as Priority,
        status: "IN_PROGRESS",
        projectId: existing.project.id,
        projectKey: existing.project.key,
        epicId: updated.epicId,
        epicTitle: existing.epic?.title ?? null,
        featureId: null,
        acceptanceCriteria:
          (updated.acceptanceCriteria as AcceptanceCriterion[]) ?? [],
        reproductionSteps: null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  } else {
    // TicketType is "BUG"
    const existing = await db.query.bugs.findFirst({
      where: (b, { and, eq, isNull }) =>
        and(eq(b.id, taskId), isNull(b.deletedAt)),
      with: {
        project: true,
        epic: { columns: { id: true, title: true } },
      },
    });

    if (!existing) {
      throw new TaskNotFoundError("BUG", taskId);
    }

    if (existing.status !== "OPEN") {
      throw new InvalidTaskStatusTransitionError(
        "BUG",
        taskId,
        existing.status,
        "OPEN",
        "CLAIM"
      );
    }

    const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;
    const claimNotes =
      options.notes?.trim() ||
      (options.agentId
        ? `Bug claimed by agent '${options.agentId}' for active development.`
        : `Bug claimed for active development.`);

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(bugs)
        .set({
          status: "IN_PROGRESS",
          updatedAt: new Date(),
        })
        .where(and(eq(bugs.id, taskId), isNull(bugs.deletedAt)))
        .returning();

      await recordActivity(tx, {
        projectId: existing.projectId,
        entityType: "BUG",
        entityId: existing.id,
        action: "CLAIMED",
        details: {
          actor: effectiveActor,
          previousStatus: "OPEN",
          nextStatus: "IN_PROGRESS",
          notes: claimNotes,
        },
      });

      return {
        id: updated.id,
        key: ticketKey,
        ticketNumber: updated.ticketNumber,
        ticketType: "BUG",
        title: updated.title,
        description: updated.description,
        priority: updated.priority as Priority,
        status: "IN_PROGRESS",
        projectId: existing.project.id,
        projectKey: existing.project.key,
        epicId: updated.epicId,
        epicTitle: existing.epic?.title ?? null,
        featureId: updated.featureId,
        acceptanceCriteria: undefined,
        reproductionSteps: updated.reproductionSteps ?? null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  }
}

