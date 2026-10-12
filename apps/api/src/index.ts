import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as dotenv from "dotenv";
import { projectsRouter } from "./routes/projects";
import { themesRouter } from "./routes/themes";

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
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Mount endpoints
app.route("/api/projects", projectsRouter);
app.route("/api/themes", themesRouter);


const port = Number(process.env.PORT) || 3001;

console.log(`Workmesh API server running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
