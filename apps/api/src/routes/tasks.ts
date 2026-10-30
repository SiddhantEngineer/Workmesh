import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  claimTask,
  TaskNotFoundError,
  InvalidTaskStatusTransitionError,
} from "@workmesh/db";
import { claimTaskBodySchema } from "@workmesh/shared";

/**
 * Router mounted at /api/tasks
 * Endpoints for polymorphic task operations (claiming, lifecycle transitions)
 * across both Features and Bugs.
 */
export const tasksRouter = new Hono()
  /**
   * PATCH /api/tasks/:id/claim
   * Claims an approved feature or open bug for active development.
   * Atomically transitions the ticket status to IN_PROGRESS and logs an audit record.
   */
  .patch("/:id/claim", zValidator("json", claimTaskBodySchema), async (c) => {
    const rawId = c.req.param("id");
    const taskId = parseInt(rawId, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return c.json({ error: "Invalid task ID: must be a positive integer" }, 400);
    }

    const body = c.req.valid("json");

    // Detect actor type from request headers or default to AGENT
    const actorHeader = c.req.header("x-actor-type");
    const isHuman = actorHeader?.toUpperCase() === "HUMAN";
    const actor = isHuman
      ? { type: "HUMAN" as const }
      : {
          type: "AGENT" as const,
          name: body.agentId?.trim() || "autonomous-agent",
        };

    try {
      const task = await claimTask(
        taskId,
        {
          ticketType: body.ticketType,
          agentId: body.agentId,
          notes: body.notes,
        },
        actor
      );

      return c.json({ data: task });
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof InvalidTaskStatusTransitionError) {
        return c.json({ error: error.message }, 409);
      }
      throw error;
    }
  });
