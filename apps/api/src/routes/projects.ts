import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listProjects,
  getProjectByKey,
  createProject,
  DuplicateProjectKeyError,
} from "@workmesh/db";
import { createProjectSchema } from "@workmesh/shared";

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
