import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createEpic,
  listEpics,
  ProjectNotFoundError,
} from "@workmesh/db";
import { createEpicBodySchema } from "@workmesh/shared";

export const epicsRouter = new Hono()
  /**
   * GET /api/projects/:key/epics
   * Lists all active epics for the specified project.
   */
  .get("/", async (c) => {
    const rawKey = c.req.param("key");
    if (!rawKey) {
      return c.json({ error: "Project key is required" }, 400);
    }

    try {
      const epics = await listEpics(rawKey);
      return c.json({ data: epics });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  })

  /**
   * POST /api/projects/:key/epics
   * Creates a new Epic under the specified project in PROPOSED status.
   */
  .post("/", zValidator("json", createEpicBodySchema), async (c) => {
    const rawKey = c.req.param("key");
    if (!rawKey) {
      return c.json({ error: "Project key is required" }, 400);
    }

    const body = c.req.valid("json");

    try {
      const newEpic = await createEpic(
        {
          projectKey: rawKey,
          ...body,
        },
        { type: "HUMAN" }
      );
      return c.json({ data: newEpic }, 201);
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  });
