import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as dotenv from "dotenv";
import { projectsRouter } from "./routes/projects";
import { epicsRouter } from "./routes/epics";
import {
  projectFeaturesRouter,
  epicFeaturesRouter,
  featuresRouter,
} from "./routes/features";
import { themesRouter } from "./routes/themes";
import { tasksRouter } from "./routes/tasks";

// Load environment variables from repository root
dotenv.config({ path: "../../.env" });

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-actor-type"],
  })
);

// Health check endpoint
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Mount endpoints
app.route("/api/projects", projectsRouter);
app.route("/api/projects/:key/epics", epicsRouter);
app.route("/api/projects/:key/features", projectFeaturesRouter);
app.route("/api/epics/:epicId/features", epicFeaturesRouter);
app.route("/api/features", featuresRouter);
app.route("/api/themes", themesRouter);
app.route("/api/tasks", tasksRouter);

// Centralized 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        code: "NOT_FOUND",
      },
    },
    404
  );
});

// Centralized unhandled error handler
app.onError((err, c) => {
  console.error(`[API Error] ${c.req.method} ${c.req.path}:`, err);
  return c.json(
    {
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    500
  );
});


const port = Number(process.env.PORT) || 3001;

console.log(`Workmesh API server running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
