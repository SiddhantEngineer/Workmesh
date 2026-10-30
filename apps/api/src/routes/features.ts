import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createFeature,
  listFeatures,
  approveFeature,
  rejectFeature,
  getFeatureByKey,
  updateFeatureCriteria,
  submitFeatureForReview,
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
  updateFeatureCriteriaBodySchema,
  submitFeatureForReviewBodySchema,
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
  })

  /**
   * GET /api/projects/:key/features/:featureKey
   * Returns a complete FeatureDetail entity (hydrated with epic, linked bugs, and activity timeline).
   */
  .get("/:featureKey", async (c) => {
    const rawKey = c.req.param("key");
    const rawFeatureKey = c.req.param("featureKey");
    if (!rawKey || !rawFeatureKey) {
      return c.json({ error: "Project key and feature key are required" }, 400);
    }

    const feature = await getFeatureByKey(rawKey, rawFeatureKey);
    if (!feature) {
      return c.json(
        {
          error: `Feature '${rawFeatureKey}' not found in project '${rawKey.toUpperCase()}'.`,
        },
        404
      );
    }

    return c.json({ data: feature });
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
  // Guard: Enforce Human-Only rule specifically for approval and rejection transitions
  .use("/:id/approve", async (c, next) => {
    const actorHeader = c.req.header("x-actor-type");
    if (actorHeader && actorHeader.toUpperCase() === "AGENT") {
      return c.json(
        {
          error:
            "Forbidden: Autonomous agents cannot approve proposed features. Human authorization required.",
        },
        403
      );
    }
    await next();
  })
  .use("/:id/reject", async (c, next) => {
    const actorHeader = c.req.header("x-actor-type");
    if (actorHeader && actorHeader.toUpperCase() === "AGENT") {
      return c.json(
        {
          error:
            "Forbidden: Autonomous agents cannot reject proposed features. Human authorization required.",
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
  )

  /**
   * PATCH /api/features/:id/criteria
   * Updates or toggles acceptance criteria for a feature.
   * Supports toggling a single criterion or replacing the full list.
   * Open to both Human and Agent actors.
   */
  .patch(
    "/:id/criteria",
    zValidator("json", updateFeatureCriteriaBodySchema),
    async (c) => {
      const rawId = c.req.param("id");
      const featureId = parseInt(rawId, 10);
      if (isNaN(featureId) || featureId <= 0) {
        return c.json(
          { error: "Invalid feature ID: must be a positive integer" },
          400
        );
      }

      const body = c.req.valid("json");

      // Extract actor details from headers
      const actorHeader = c.req.header("x-actor-type");
      const isAgent = actorHeader?.toUpperCase() === "AGENT";
      const actor = isAgent
        ? { type: "AGENT" as const, name: "autonomous-agent" }
        : { type: "HUMAN" as const };

      try {
        const updated = await updateFeatureCriteria(featureId, body, actor);
        return c.json({ data: updated });
      } catch (error) {
        if (error instanceof FeatureNotFoundError) {
          return c.json({ error: error.message }, 404);
        }
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        throw error;
      }
    }
  )

  /**
   * POST /api/features/:id/submit
   * Transitions a feature from IN_PROGRESS to READY_FOR_TEST upon agent completion.
   * Open to Agent and Human actors.
   */
  .post(
    "/:id/submit",
    zValidator("json", submitFeatureForReviewBodySchema),
    async (c) => {
      const rawId = c.req.param("id");
      const featureIdOrKey = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;

      const body = c.req.valid("json");

      // Extract actor details from headers or default to AGENT
      const actorHeader = c.req.header("x-actor-type");
      const agentIdHeader = c.req.header("x-agent-id");
      const isHuman = actorHeader?.toUpperCase() === "HUMAN";
      const actor = isHuman
        ? { type: "HUMAN" as const }
        : {
            type: "AGENT" as const,
            name: agentIdHeader?.trim() || "autonomous-agent",
          };

      try {
        const submitted = await submitFeatureForReview(
          featureIdOrKey,
          body,
          actor
        );
        return c.json({ data: submitted });
      } catch (error) {
        if (error instanceof FeatureNotFoundError) {
          return c.json({ error: error.message }, 404);
        }
        if (error instanceof InvalidFeatureStatusTransitionError) {
          return c.json({ error: error.message }, 409);
        }
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        throw error;
      }
    }
  );

