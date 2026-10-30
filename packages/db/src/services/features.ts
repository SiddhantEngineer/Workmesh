import { eq, and, isNull, sql, asc, desc } from "drizzle-orm";
import { db } from "../client";
import { projects } from "../schema/projects";
import { epics } from "../schema/epics";
import { features } from "../schema/features";
import { recordActivity } from "./activity_logs";
import { ProjectNotFoundError, AmbiguousProjectError } from "./projects";
import type {
  CreateFeatureInput,
  Feature,
  FeatureStatus,
  AcceptanceCriterion,
  FeatureDetail,
  Priority,
  UpdateFeatureCriteriaBodyInput,
  SubmitFeatureForReviewBodyInput,
} from "@workmesh/shared";
import type { ActivityActor } from "../schema/activity_logs";

export class EpicNotFoundError extends Error {
  constructor(public readonly epicId: number) {
    super(`Epic with ID ${epicId} was not found or has been deleted.`);
    this.name = "EpicNotFoundError";
  }
}

export class EpicProjectMismatchError extends Error {
  constructor(
    public readonly epicId: number,
    public readonly expectedKey: string,
    public readonly actualKey: string
  ) {
    super(
      `Epic ${epicId} belongs to project '${actualKey}', not '${expectedKey}'.`
    );
    this.name = "EpicProjectMismatchError";
  }
}

export class FeatureNotFoundError extends Error {
  constructor(public readonly featureId: number) {
    super(`Feature with ID ${featureId} was not found or has been deleted.`);
    this.name = "FeatureNotFoundError";
  }
}

export class InvalidFeatureStatusTransitionError extends Error {
  constructor(
    public readonly featureId: number,
    public readonly currentStatus: string,
    public readonly attemptedAction: string,
    public readonly expectedStatus: string = "PROPOSED"
  ) {
    super(
      `Cannot ${attemptedAction.toLowerCase()} Feature ${featureId}: current status is '${currentStatus}', but status '${expectedStatus}' is required.`
    );
    this.name = "InvalidFeatureStatusTransitionError";
  }
}

export class HumanActorRequiredError extends Error {
  constructor(public readonly action: string) {
    super(
      `Forbidden: Action '${action}' requires human authorization. Autonomous agents cannot approve or reject tickets.`
    );
    this.name = "HumanActorRequiredError";
  }
}


/**
 * Creates a Feature under an Epic.
 * Validates the parent Epic, claims the next project-scoped ticket sequence atomically,
 * normalizes acceptance criteria checklists, saves the feature with initial status PROPOSED,
 * and records an activity audit trail.
 */
export async function createFeature(
  input: CreateFeatureInput,
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Feature> {
  // 1. Verify parent Epic exists and is active
  const parentEpic = await db.query.epics.findFirst({
    where: (e, { and, eq, isNull }) =>
      and(eq(e.id, input.epicId), isNull(e.deletedAt)),
    with: {
      project: true,
    },
  });

  if (!parentEpic) {
    throw new EpicNotFoundError(input.epicId);
  }

  // 2. Cross-project boundary check if projectKey or projectId was supplied
  if (input.projectKey) {
    const expectedKey = input.projectKey.trim().toUpperCase();
    if (parentEpic.project.key.toUpperCase() !== expectedKey) {
      throw new EpicProjectMismatchError(
        input.epicId,
        expectedKey,
        parentEpic.project.key
      );
    }
  }

  if (input.projectId && parentEpic.project.id !== input.projectId) {
    throw new EpicProjectMismatchError(
      input.epicId,
      String(input.projectId),
      parentEpic.project.key
    );
  }

  // 3. Atomic sequence allocation, insertion, and audit recording
  return await db.transaction(async (tx) => {
    const [updatedProject] = await tx
      .update(projects)
      .set({
        nextTicketNumber: sql`${projects.nextTicketNumber} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(projects.id, parentEpic.projectId), isNull(projects.deletedAt))
      )
      .returning({
        id: projects.id,
        key: projects.key,
        nextTicketNumber: projects.nextTicketNumber,
      });

    if (!updatedProject) {
      throw new ProjectNotFoundError(
        `Project for Epic ${input.epicId} was not found or has been deleted.`
      );
    }

    const allocatedTicketNumber = updatedProject.nextTicketNumber - 1;
    const ticketKey = `${updatedProject.key}-${allocatedTicketNumber}`;

    // Normalize acceptance criteria into structured checklist objects
    const structuredCriteria: AcceptanceCriterion[] =
      input.acceptanceCriteria.map((item) => ({
        text: item.trim(),
        completed: false,
      }));

    const [newFeature] = await tx
      .insert(features)
      .values({
        projectId: updatedProject.id,
        epicId: parentEpic.id,
        ticketNumber: allocatedTicketNumber,
        title: input.title.trim(),
        description: input.description?.trim() || "",
        priority: input.priority || "MEDIUM",
        status: "PROPOSED",
        acceptanceCriteria: structuredCriteria,
      })
      .returning();

    // Record audit activity log
    await recordActivity(tx, {
      projectId: updatedProject.id,
      entityType: "FEATURE",
      entityId: newFeature.id,
      action: "CREATED",
      details: {
        actor,
        notes: `Feature '${newFeature.title}' (${ticketKey}) created under Epic '${parentEpic.title}'`,
      },
    });

    return {
      ...(newFeature as unknown as Feature),
      key: ticketKey,
    };
  });
}

export interface ListFeaturesOptions {
  epicId?: number;
  status?: FeatureStatus;
}

/**
 * Lists all active (non-deleted) features for a project, optionally filtered by epicId or status.
 */
export async function listFeatures(
  projectKeyOrId: string | number,
  options: ListFeaturesOptions = {}
): Promise<Feature[]> {
  const isKey = typeof projectKeyOrId === "string";
  const rawKey = isKey ? projectKeyOrId.trim().toUpperCase() : undefined;
  const rawId = isKey ? undefined : projectKeyOrId;

  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(
        rawKey ? eq(p.key, rawKey) : eq(p.id, rawId!),
        isNull(p.deletedAt)
      ),
  });

  if (!project) {
    throw new ProjectNotFoundError(
      `No active project exists with identifier "${projectKeyOrId}".`
    );
  }

  const rows = await db.query.features.findMany({
    where: (f, { and, eq, isNull }) =>
      and(
        eq(f.projectId, project.id),
        isNull(f.deletedAt),
        options.epicId ? eq(f.epicId, options.epicId) : undefined,
        options.status ? eq(f.status, options.status) : undefined
      ),
    orderBy: (f, { asc }) => [asc(f.ticketNumber)],
  });

  return rows.map((f) => ({
    ...(f as unknown as Feature),
    key: `${project.key}-${f.ticketNumber}`,
  }));
}

export interface ApproveFeatureOptions {
  notes?: string;
}

/**
 * Transitions a feature from PROPOSED to APPROVED.
 * Enforces human-only authorization and status validation.
 * Records an activity audit log.
 */
export async function approveFeature(
  featureId: number,
  options: ApproveFeatureOptions = {},
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Feature> {
  if (actor.type !== "HUMAN") {
    throw new HumanActorRequiredError("APPROVE");
  }

  const existing = await db.query.features.findFirst({
    where: (f, { and, eq, isNull }) =>
      and(eq(f.id, featureId), isNull(f.deletedAt)),
    with: {
      project: true,
    },
  });

  if (!existing) {
    throw new FeatureNotFoundError(featureId);
  }

  if (existing.status !== "PROPOSED") {
    throw new InvalidFeatureStatusTransitionError(
      featureId,
      existing.status,
      "APPROVE"
    );
  }

  const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(features)
      .set({
        status: "APPROVED",
        updatedAt: new Date(),
      })
      .where(and(eq(features.id, featureId), isNull(features.deletedAt)))
      .returning();

    await recordActivity(tx, {
      projectId: existing.projectId,
      entityType: "FEATURE",
      entityId: existing.id,
      action: "APPROVED",
      details: {
        actor,
        previousStatus: "PROPOSED",
        nextStatus: "APPROVED",
        notes:
          options.notes?.trim() ||
          `Feature '${existing.title}' (${ticketKey}) approved by human manager.`,
      },
    });

    return {
      ...(updated as unknown as Feature),
      key: ticketKey,
    };
  });
}

export interface RejectFeatureOptions {
  reason: string;
}

/**
 * Transitions a feature from PROPOSED to REJECTED.
 * Enforces human-only authorization, requires a rejection reason,
 * and records an activity audit log.
 */
export async function rejectFeature(
  featureId: number,
  options: RejectFeatureOptions,
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Feature> {
  if (actor.type !== "HUMAN") {
    throw new HumanActorRequiredError("REJECT");
  }

  const trimmedReason = options.reason?.trim();
  if (!trimmedReason) {
    throw new Error("Rejection reason cannot be empty.");
  }

  const existing = await db.query.features.findFirst({
    where: (f, { and, eq, isNull }) =>
      and(eq(f.id, featureId), isNull(f.deletedAt)),
    with: {
      project: true,
    },
  });

  if (!existing) {
    throw new FeatureNotFoundError(featureId);
  }

  if (existing.status !== "PROPOSED") {
    throw new InvalidFeatureStatusTransitionError(
      featureId,
      existing.status,
      "REJECT"
    );
  }

  const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(features)
      .set({
        status: "REJECTED",
        updatedAt: new Date(),
      })
      .where(and(eq(features.id, featureId), isNull(features.deletedAt)))
      .returning();

    await recordActivity(tx, {
      projectId: existing.projectId,
      entityType: "FEATURE",
      entityId: existing.id,
      action: "REJECTED",
      details: {
        actor,
        previousStatus: "PROPOSED",
        nextStatus: "REJECTED",
        notes: trimmedReason,
      },
    });

    return {
      ...(updated as unknown as Feature),
      key: ticketKey,
    };
  });
}

/**
 * Retrieves a full FeatureDetail by project prefix key and ticket number or formatted key (e.g. 'WM-4' or 4).
 * Hydrates parent project, parent epic, linked bugs, and chronological audit activity logs.
 */
export async function getFeatureByKey(
  projectKey: string,
  ticketNumberOrKey: string | number
): Promise<FeatureDetail | null> {
  const upperKey = projectKey.trim().toUpperCase();

  let ticketNumber: number;
  if (typeof ticketNumberOrKey === "number") {
    ticketNumber = ticketNumberOrKey;
  } else {
    const trimmed = ticketNumberOrKey.trim();
    if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      ticketNumber = parseInt(parts[parts.length - 1], 10);
    } else {
      ticketNumber = parseInt(trimmed, 10);
    }
  }

  if (isNaN(ticketNumber) || ticketNumber <= 0) {
    return null;
  }

  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, isNull }) =>
      and(eq(p.key, upperKey), isNull(p.deletedAt)),
  });

  if (!project) {
    return null;
  }

  const feature = await db.query.features.findFirst({
    where: (f, { and, eq, isNull }) =>
      and(
        eq(f.projectId, project.id),
        eq(f.ticketNumber, ticketNumber),
        isNull(f.deletedAt)
      ),
    with: {
      epic: {
        columns: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
        },
      },
      bugs: {
        where: (b, { isNull }) => isNull(b.deletedAt),
        orderBy: (b, { asc }) => [asc(b.ticketNumber)],
        columns: {
          id: true,
          ticketNumber: true,
          title: true,
          priority: true,
          status: true,
        },
      },
    },
  });

  if (!feature) {
    return null;
  }

  // Fetch chronological audit activity logs for this feature
  const logs = await db.query.activityLogs.findMany({
    where: (a, { and, eq }) =>
      and(eq(a.entityType, "FEATURE"), eq(a.entityId, feature.id)),
    orderBy: (a, { desc }) => [desc(a.createdAt)],
    columns: {
      id: true,
      action: true,
      details: true,
      createdAt: true,
    },
  });

  const formattedTicketKey = `${project.key}-${feature.ticketNumber}`;

  return {
    id: feature.id,
    projectId: feature.projectId,
    projectKey: project.key,
    projectName: project.name,
    epicId: feature.epicId,
    ticketNumber: feature.ticketNumber,
    key: formattedTicketKey,
    title: feature.title,
    description: feature.description,
    priority: feature.priority,
    status: feature.status,
    acceptanceCriteria:
      (feature.acceptanceCriteria as AcceptanceCriterion[]) ?? [],
    epic: feature.epic
      ? {
          id: feature.epic.id,
          key: `${project.key}-${feature.epic.ticketNumber}`,
          title: feature.epic.title,
          status: feature.epic.status,
        }
      : null,
    linkedBugs: (feature.bugs || []).map((b) => ({
      id: b.id,
      key: `${project.key}-${b.ticketNumber}`,
      ticketNumber: b.ticketNumber,
      title: b.title,
      priority: b.priority as Priority,
      status: b.status,
    })),
    activityLogs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details as Record<string, unknown> | null,
      createdAt: l.createdAt,
    })),
    createdAt: feature.createdAt,
    updatedAt: feature.updatedAt,
  };
}

/**
 * Updates or toggles acceptance criteria on a feature.
 * Supports toggling a single item by index or replacing the entire checklist.
 * Records an activity audit log entry on mutation.
 */
export async function updateFeatureCriteria(
  featureId: number,
  input: UpdateFeatureCriteriaBodyInput,
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Feature> {
  const existing = await db.query.features.findFirst({
    where: (f, { and, eq, isNull }) =>
      and(eq(f.id, featureId), isNull(f.deletedAt)),
    with: {
      project: true,
    },
  });

  if (!existing) {
    throw new FeatureNotFoundError(featureId);
  }

  let nextCriteria: AcceptanceCriterion[];

  if (input.criteria !== undefined) {
    nextCriteria = input.criteria;
  } else if (
    input.criteriaIndex !== undefined &&
    input.completed !== undefined
  ) {
    const current =
      (existing.acceptanceCriteria as AcceptanceCriterion[]) ?? [];
    if (input.criteriaIndex < 0 || input.criteriaIndex >= current.length) {
      throw new Error(
        `Criteria index ${input.criteriaIndex} out of bounds (feature has ${current.length} criteria).`
      );
    }
    nextCriteria = current.map((item, idx) =>
      idx === input.criteriaIndex
        ? { ...item, completed: input.completed! }
        : item
    );
  } else {
    throw new Error("Invalid criteria update payload.");
  }

  const completedCount = nextCriteria.filter((c) => c.completed).length;
  const totalCount = nextCriteria.length;
  const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(features)
      .set({
        acceptanceCriteria: nextCriteria,
        updatedAt: new Date(),
      })
      .where(and(eq(features.id, featureId), isNull(features.deletedAt)))
      .returning();

    await recordActivity(tx, {
      projectId: existing.projectId,
      entityType: "FEATURE",
      entityId: existing.id,
      action: "UPDATED",
      details: {
        actor,
        notes: `Acceptance criteria updated (${completedCount}/${totalCount} completed)`,
        metadata: {
          criteriaStats: { completed: completedCount, total: totalCount },
        },
      },
    });

    return {
      ...(updated as unknown as Feature),
      key: ticketKey,
    };
  });
}

/**
 * Transitions a feature from IN_PROGRESS to READY_FOR_TEST upon agent completion.
 * Marks specified criteria (or all criteria if omitted) as completed,
 * updates feature status, and records an activity audit log with agent notes.
 *
 * Supports passing either an internal feature ID (number) or a formatted ticket key (e.g. "WM-4").
 */
export async function submitFeatureForReview(
  featureIdOrKey: number | string,
  input: SubmitFeatureForReviewBodyInput = {},
  actor: ActivityActor = { type: "AGENT" }
): Promise<Feature> {
  let existing:
    | (typeof features.$inferSelect & { project: typeof projects.$inferSelect })
    | undefined
    | null = null;

  if (typeof featureIdOrKey === "number") {
    existing = await db.query.features.findFirst({
      where: (f, { and, eq, isNull }) =>
        and(eq(f.id, featureIdOrKey), isNull(f.deletedAt)),
      with: { project: true },
    });
  } else {
    const raw = featureIdOrKey.trim();
    if (/^\d+$/.test(raw)) {
      const numId = parseInt(raw, 10);
      existing = await db.query.features.findFirst({
        where: (f, { and, eq, isNull }) =>
          and(eq(f.id, numId), isNull(f.deletedAt)),
        with: { project: true },
      });
    } else {
      const parts = raw.split("-");
      if (parts.length >= 2) {
        const projectKey = parts[0].toUpperCase();
        const ticketNumber = parseInt(parts.slice(1).join("-"), 10);
        const proj = await db.query.projects.findFirst({
          where: (p, { and, eq, isNull }) =>
            and(eq(p.key, projectKey), isNull(p.deletedAt)),
        });
        if (proj && !isNaN(ticketNumber)) {
          existing = await db.query.features.findFirst({
            where: (f, { and, eq, isNull }) =>
              and(
                eq(f.projectId, proj.id),
                eq(f.ticketNumber, ticketNumber),
                isNull(f.deletedAt)
              ),
            with: { project: true },
          });
        }
      }
    }
  }

  if (!existing) {
    const numericId = typeof featureIdOrKey === "number" ? featureIdOrKey : 0;
    throw new FeatureNotFoundError(numericId);
  }

  if (existing.status !== "IN_PROGRESS") {
    throw new InvalidFeatureStatusTransitionError(
      existing.id,
      existing.status,
      "SUBMIT_FOR_REVIEW",
      "IN_PROGRESS"
    );
  }

  const currentCriteria =
    (existing.acceptanceCriteria as AcceptanceCriterion[]) ?? [];

  let nextCriteria: AcceptanceCriterion[];

  if (input.completedCriteria && input.completedCriteria.length > 0) {
    if (typeof input.completedCriteria[0] === "boolean") {
      const boolList = input.completedCriteria as boolean[];
      nextCriteria = currentCriteria.map((item, idx) => ({
        ...item,
        completed: Boolean(boolList[idx]),
      }));
    } else {
      const indexList = input.completedCriteria as number[];
      const indexSet = new Set(indexList);
      nextCriteria = currentCriteria.map((item, idx) => ({
        ...item,
        completed: indexSet.has(idx),
      }));
    }
  } else {
    // If not explicitly provided, mark all criteria as completed
    nextCriteria = currentCriteria.map((item) => ({
      ...item,
      completed: true,
    }));
  }

  const completedCount = nextCriteria.filter((c) => c.completed).length;
  const totalCount = nextCriteria.length;
  const ticketKey = `${existing.project.key}-${existing.ticketNumber}`;
  const notes =
    input.notes?.trim() ||
    `Feature '${existing.title}' (${ticketKey}) submitted for review. All criteria verified.`;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(features)
      .set({
        status: "READY_FOR_TEST",
        acceptanceCriteria: nextCriteria,
        updatedAt: new Date(),
      })
      .where(and(eq(features.id, existing.id), isNull(features.deletedAt)))
      .returning();

    await recordActivity(tx, {
      projectId: existing.projectId,
      entityType: "FEATURE",
      entityId: existing.id,
      action: "SUBMITTED_FOR_REVIEW",
      details: {
        actor,
        previousStatus: "IN_PROGRESS",
        nextStatus: "READY_FOR_TEST",
        notes,
        metadata: {
          criteriaStats: { completed: completedCount, total: totalCount },
        },
      },
    });

    return {
      ...(updated as unknown as Feature),
      key: ticketKey,
    };
  });
}


