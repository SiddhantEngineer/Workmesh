import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db, projects, activityLogs } from "@workmesh/db";
import { createProjectSchema } from "@workmesh/shared";

export const projectsRouter = new Hono()
  /**
   * GET /api/projects
   * Returns list of all active projects, newest first.
   */
  .get("/", async (c) => {
    const list = await db.query.projects.findMany({
      where: (p, { isNull }) => isNull(p.deletedAt),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
    return c.json({ data: list });
  })

  /**
   * GET /api/projects/:key
   * Returns a single project by uppercase prefix key along with
   * lightweight summaries of epics and features for the board view.
   */
  .get("/:key", async (c) => {
    const rawKey = c.req.param("key");
    const upperKey = rawKey.toUpperCase();

    const project = await db.query.projects.findFirst({
      where: (p, { and, eq, isNull }) => and(eq(p.key, upperKey), isNull(p.deletedAt)),
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

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json({ data: project });
  })

  /**
   * POST /api/projects
   * Creates a new project with unique prefix key and logs activity.
   */
  .post("/", zValidator("json", createProjectSchema), async (c) => {
    const data = c.req.valid("json");

    // 1. Check if ticket key is already taken
    const existing = await db.query.projects.findFirst({
      where: (p, { eq }) => eq(p.key, data.key),
    });

    if (existing) {
      return c.json(
        { error: `Project key '${data.key}' is already in use` },
        409
      );
    }

    // 2. Insert new project
    const [newProject] = await db
      .insert(projects)
      .values({
        name: data.name,
        key: data.key,
        description: data.description || null,
        themeId: data.themeId,
      })
      .returning();

    // 3. Record CREATED event in activity_logs
    await db.insert(activityLogs).values({
      projectId: newProject.id,
      entityType: "PROJECT",
      entityId: newProject.id,
      action: "CREATED",
      details: {
        actor: { type: "HUMAN" },
        notes: `Project '${newProject.name}' (${newProject.key}) created`,
      },
    });

    return c.json({ data: newProject }, 201);
  });
