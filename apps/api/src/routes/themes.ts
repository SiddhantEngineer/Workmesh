import { Hono } from "hono";
import { db } from "@workmesh/db";

export const themesRouter = new Hono()
  /**
   * GET /api/themes
   * Returns list of all available themes for client caching & project selection.
   */
  .get("/", async (c) => {
    const list = await db.query.themes.findMany({
      orderBy: (t, { asc }) => [asc(t.id)],
    });
    return c.json({ data: list });
  });
