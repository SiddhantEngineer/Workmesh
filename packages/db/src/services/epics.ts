import { eq, and, isNull, sql, asc } from "drizzle-orm";
import { db } from "../client";
import { projects } from "../schema/projects";
import { epics } from "../schema/epics";
import { recordActivity } from "./activity_logs";
import { ProjectNotFoundError, AmbiguousProjectError } from "./projects";
import type { CreateEpicInput, Epic } from "@workmesh/shared";
import type { ActivityActor } from "../schema/activity_logs";


/**
 * Resolves a project row from explicit projectKey, projectId, or fallback environment/single project.
 */
async function resolveProject(targetKey?: string, targetId?: number) {
  let resolvedKey = targetKey?.trim()?.toUpperCase();
  let resolvedId = targetId;

  if (!resolvedKey && !resolvedId) {
    const envKey =
      process.env.WORKMESH_PROJECT_KEY || process.env.DEFAULT_PROJECT_KEY;

    if (envKey) {
      resolvedKey = envKey.trim().toUpperCase();
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
        resolvedId = activeProjects[0].id;
        resolvedKey = activeProjects[0].key;
      } else {
        const keys = activeProjects.map((p) => p.key);
        throw new AmbiguousProjectError(keys);
      }
    }
  }

  const isNumericKey = Boolean(resolvedKey && /^\d+$/.test(resolvedKey));
  const numericId = resolvedId ?? (resolvedKey && isNumericKey ? parseInt(resolvedKey, 10) : undefined);

  const project = await db.query.projects.findFirst({
    where: (p, { and, eq, or, isNull }) =>
      and(
        resolvedKey && numericId
          ? or(eq(p.key, resolvedKey), eq(p.id, numericId))
          : resolvedKey
          ? eq(p.key, resolvedKey)
          : eq(p.id, numericId!),
        isNull(p.deletedAt)
      ),
  });

  if (!project) {
    const identifierMsg = resolvedKey
      ? `with key "${resolvedKey}"`
      : `with ID "${resolvedId}"`;
    throw new ProjectNotFoundError(`No active project exists ${identifierMsg}.`);
  }

  return project;
}

/**
 * Creates an Epic within a project.
 * Uses a database transaction to atomically increment the project-scoped ticket sequence,
 * assign the ticket key, insert the epic with initial status PROPOSED, and record an audit log.
 */
export async function createEpic(
  input: CreateEpicInput,
  actor: ActivityActor = { type: "HUMAN" }
): Promise<Epic> {
  const project = await resolveProject(input.projectKey, input.projectId);

  return await db.transaction(async (tx) => {
    // Atomically increment the project-scoped ticket counter
    const [updatedProject] = await tx
      .update(projects)
      .set({
        nextTicketNumber: sql`${projects.nextTicketNumber} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, project.id), isNull(projects.deletedAt)))
      .returning({
        id: projects.id,
        key: projects.key,
        nextTicketNumber: projects.nextTicketNumber,
      });

    if (!updatedProject) {
      throw new ProjectNotFoundError(
        `Project ${project.key} was not found or has been deleted.`
      );
    }

    // Since RETURNING yields the incremented counter, the claimed ticket number is (new - 1)
    const allocatedTicketNumber = updatedProject.nextTicketNumber - 1;
    const ticketKey = `${updatedProject.key}-${allocatedTicketNumber}`;

    const [newEpic] = await tx
      .insert(epics)
      .values({
        projectId: updatedProject.id,
        ticketNumber: allocatedTicketNumber,
        title: input.title.trim(),
        description: input.description?.trim() || "",
        priority: input.priority || "HIGH",
        status: "PROPOSED",
      })
      .returning();

    // Record audit activity log
    await recordActivity(tx, {
      projectId: updatedProject.id,
      entityType: "EPIC",
      entityId: newEpic.id,
      action: "CREATED",
      details: {
        actor,
        notes: `Epic '${newEpic.title}' (${ticketKey}) created`,
      },
    });

    return {
      ...(newEpic as unknown as Epic),
      key: ticketKey,
    };
  });
}

/**
 * Lists all active (non-deleted) epics for a project, sorted by ticketNumber ascending.
 */
export async function listEpics(
  projectKeyOrId: string | number
): Promise<Epic[]> {
  const isKey = typeof projectKeyOrId === "string";
  const project = await resolveProject(
    isKey ? projectKeyOrId : undefined,
    isKey ? undefined : projectKeyOrId
  );

  const rows = await db.query.epics.findMany({
    where: (e, { and, eq, isNull }) =>
      and(eq(e.projectId, project.id), isNull(e.deletedAt)),
    orderBy: (e, { asc }) => [asc(e.ticketNumber)],
  });

  return rows.map((epic) => ({
    ...(epic as unknown as Epic),
    key: `${project.key}-${epic.ticketNumber}`,
  }));
}
