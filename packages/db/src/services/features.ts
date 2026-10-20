import { eq, and, isNull, sql, asc } from "drizzle-orm";
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
    public readonly attemptedAction: "APPROVE" | "REJECT"
  ) {
    super(
      `Cannot ${attemptedAction.toLowerCase()} Feature ${featureId}: only features with status 'PROPOSED' can be transitioned (current status: '${currentStatus}').`
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

