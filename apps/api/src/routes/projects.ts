import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listProjects,
  getProjectByKey,
  createProject,
  deleteProjectByKey,
  DuplicateProjectKeyError,
  listActionableTasks,
  ProjectNotFoundError,
} from "@workmesh/db";
import {
  createProjectSchema,
  listActionableTasksQuerySchema,
} from "@workmesh/shared";

export const projectsRouter = new Hono()
  /**
   * GET /api/projects
   * Returns list of all active projects, newest first.
   */
  .get("/", async (c) => {
    const list = await listProjects();
    return c.json({ data: list });
  })

  /**
   * GET /api/projects/:key
   * Returns a single project by uppercase prefix key along with
   * lightweight summaries of epics and features for the board view.
   */
  .get("/:key", async (c) => {
    const rawKey = c.req.param("key");
    const project = await getProjectByKey(rawKey);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json({ data: project });
  })

  /**
   * GET /api/projects/:key/actionable-tasks
   * Returns prioritized actionable tasks (approved features and open bugs)
   * ready for autonomous agent execution or human backlog inspection.
   */
  .get(
    "/:key/actionable-tasks",
    zValidator("query", listActionableTasksQuerySchema),
    async (c) => {
      const rawKey = c.req.param("key");
      const query = c.req.valid("query");

      try {
        const tasks = await listActionableTasks(rawKey, query);
        return c.json({ data: tasks });
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          return c.json({ error: error.message }, 404);
        }
        throw error;
      }
    }
  )

  /**
   * DELETE /api/projects/:key
   * Deletes a project by prefix key, cascading through its epics, features, and logs.
   */
  .delete("/:key", async (c) => {
    const rawKey = c.req.param("key");
    if (!rawKey) {
      return c.json({ error: "Project key is required" }, 400);
    }

    try {
      const deleted = await deleteProjectByKey(rawKey);
      return c.json({
        success: true,
        message: `Project '${deleted.key}' (${deleted.name}) deleted successfully`,
        data: deleted,
      });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  })

  /**
   * POST /api/projects
   * Creates a new project with unique prefix key and logs activity in an atomic transaction.
   */
  .post("/", zValidator("json", createProjectSchema), async (c) => {
    const data = c.req.valid("json");

    try {
      const newProject = await createProject(data, { type: "HUMAN" });
      return c.json({ data: newProject }, 201);
    } catch (error) {
      if (error instanceof DuplicateProjectKeyError) {
        return c.json({ error: error.message }, 409);
      }
      throw error;
    }
  });
