import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createFeature,
  listFeatures,
  approveFeature,
  rejectFeature,
  EpicNotFoundError,
  EpicProjectMismatchError,
  ProjectNotFoundError,
  FeatureNotFoundError,
  InvalidFeatureStatusTransitionError,
  HumanActorRequiredError,
} from "@workmesh/db";
import {
  createFeatureBodySchema,
  approveFeatureBodySchema,
  rejectFeatureBodySchema,
  type FeatureStatus,
} from "@workmesh/shared";

/**
 * Router mounted at /api/projects/:key/features
 */
export const projectFeaturesRouter = new Hono()
  /**
   * GET /api/projects/:key/features
   * Lists all active features for the project, with optional epicId and status filtering.
   */
  .get("/", async (c) => {
    const rawKey = c.req.param("key");
    if (!rawKey) {
      return c.json({ error: "Project key is required" }, 400);
    }

    const epicIdQuery = c.req.query("epicId");
    const statusQuery = c.req.query("status") as FeatureStatus | undefined;

    try {
      const features = await listFeatures(rawKey, {
        epicId: epicIdQuery ? parseInt(epicIdQuery, 10) : undefined,
        status: statusQuery,
      });
      return c.json({ data: features });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  })

  /**
   * POST /api/projects/:key/features
   * Creates a new Feature under an Epic belonging to this project.
   */
  .post("/", zValidator("json", createFeatureBodySchema), async (c) => {
    const rawKey = c.req.param("key");
    if (!rawKey) {
      return c.json({ error: "Project key is required" }, 400);
    }

    const body = c.req.valid("json");

    try {
      const newFeature = await createFeature(
        {
          projectKey: rawKey,
          ...body,
        },
        { type: "HUMAN" }
      );
      return c.json({ data: newFeature }, 201);
    } catch (error) {
      if (
        error instanceof EpicNotFoundError ||
        error instanceof ProjectNotFoundError
      ) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof EpicProjectMismatchError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  });

/**
 * Router mounted at /api/epics/:epicId/features
 */
export const epicFeaturesRouter = new Hono()
  /**
   * POST /api/epics/:epicId/features
   * Creates a new Feature directly scoped to a parent Epic ID.
   */
  .post(
    "/",
    zValidator("json", createFeatureBodySchema.omit({ epicId: true })),
    async (c) => {
      const rawEpicId = c.req.param("epicId");
      if (!rawEpicId) {
        return c.json({ error: "Epic ID is required" }, 400);
      }
      const epicId = parseInt(rawEpicId, 10);
      if (isNaN(epicId) || epicId <= 0) {
        return c.json({ error: "Invalid epic ID" }, 400);
      }

      const body = c.req.valid("json");

      try {
        const newFeature = await createFeature(
          {
            epicId,
            ...body,
          },
          { type: "HUMAN" }
        );
        return c.json({ data: newFeature }, 201);
      } catch (error) {
        if (
          error instanceof EpicNotFoundError ||
          error instanceof ProjectNotFoundError
        ) {
          return c.json({ error: error.message }, 404);
        }
        throw error;
      }
    }
  );

/**
 * Router mounted at /api/features
 * Dedicated endpoints for individual feature state transitions.
 */
export const featuresRouter = new Hono()
  // Global guard: Enforce Human-Only rule for all feature transition endpoints
  .use("/*", async (c, next) => {
    const actorHeader = c.req.header("x-actor-type");
    if (actorHeader && actorHeader.toUpperCase() === "AGENT") {
      return c.json(
        {
          error:
            "Forbidden: Autonomous agents cannot approve or reject proposed features. Human authorization required.",
        },
        403
      );
    }
    await next();
  })

  /**
   * PATCH /api/features/:id/approve
   * Transitions a feature from PROPOSED to APPROVED.
   * Enforces human-only operator policy.
   */
  .patch("/:id/approve", async (c) => {
    const rawId = c.req.param("id");
    const featureId = parseInt(rawId, 10);
    if (isNaN(featureId) || featureId <= 0) {
      return c.json({ error: "Invalid feature ID" }, 400);
    }

    // Optional body for approval notes
    let notes: string | undefined;
    try {
      const body = await c.req.json();
      const parsed = approveFeatureBodySchema.safeParse(body);
      if (parsed.success) {
        notes = parsed.data?.notes;
      }
    } catch {
      // Body is optional for approval
    }

    try {
      const approvedFeature = await approveFeature(
        featureId,
        { notes },
        { type: "HUMAN" }
      );
      return c.json({ data: approvedFeature });
    } catch (error) {
      if (error instanceof FeatureNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof InvalidFeatureStatusTransitionError) {
        return c.json({ error: error.message }, 400);
      }
      if (error instanceof HumanActorRequiredError) {
        return c.json({ error: error.message }, 403);
      }
      throw error;
    }
  })

  /**
   * PATCH /api/features/:id/reject
   * Transitions a feature from PROPOSED to REJECTED with a required reason.
   * Enforces human-only operator policy.
   */
  .patch(
    "/:id/reject",
    zValidator("json", rejectFeatureBodySchema),
    async (c) => {
      const rawId = c.req.param("id");
      const featureId = parseInt(rawId, 10);
      if (isNaN(featureId) || featureId <= 0) {
        return c.json({ error: "Invalid feature ID" }, 400);
      }

      const body = c.req.valid("json");

      try {
        const rejectedFeature = await rejectFeature(
          featureId,
          { reason: body.reason },
          { type: "HUMAN" }
        );
        return c.json({ data: rejectedFeature });
      } catch (error) {
        if (error instanceof FeatureNotFoundError) {
          return c.json({ error: error.message }, 404);
        }
        if (error instanceof InvalidFeatureStatusTransitionError) {
          return c.json({ error: error.message }, 400);
        }
        if (error instanceof HumanActorRequiredError) {
          return c.json({ error: error.message }, 403);
        }
        throw error;
      }
    }
  );

