import { z } from "zod";
import {
  PRIORITY_LEVELS,
  type Priority,
  type FeatureStatus,
  type BugStatus,
} from "./enums";
import type { AcceptanceCriterion } from "./features";

/**
 * Task ticket discriminator: whether the actionable item is a Feature or a Bug.
 */
export const TASK_TYPES = ["FEATURE", "BUG"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

/**
 * Numerical weight assigned to each priority level to ensure deterministic sorting.
 * Lower weight = higher urgency (CRITICAL is top priority).
 */
export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * Unified data contract for an actionable task.
 * Aggregates features and bugs into a single normalized structure
 * for AI agent discovery, board claiming, and execution.
 */
export interface ActionableTask {
  id: number;
  key: string; // e.g. "WM-4"
  ticketNumber: number;
  ticketType: TaskType;
  title: string;
  description: string;
  priority: Priority;
  status: FeatureStatus | BugStatus;
  projectId: number;
  projectKey: string;
  epicId?: number | null;
  epicTitle?: string | null;
  featureId?: number | null; // Set when a bug is linked to a parent feature
  acceptanceCriteria?: AcceptanceCriterion[]; // Provided for features
  reproductionSteps?: string | null; // Provided for bugs
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Validation schema for HTTP query parameters on:
 * GET /api/projects/:key/actionable-tasks
 */
export const listActionableTasksQuerySchema = z.object({
  epicId: z.coerce.number().int().positive().optional(),
  status: z.string().trim().optional(),
  ticketType: z.enum(["FEATURE", "BUG", "ALL"]).default("ALL").optional(),
});

export type ListActionableTasksQuery = z.infer<
  typeof listActionableTasksQuerySchema
>;

/**
 * Validation schema for the MCP tool `list_actionable_tasks`.
 * Allows autonomous agents to specify a project, filter by epic or status,
 * or default to the current active workspace project.
 */
export const listActionableTasksInputSchema = z.object({
  projectKey: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(10)
    .optional()
    .describe(
      "Project prefix key (e.g. 'WM'). If omitted, defaults to the active project in context."
    ),
  projectId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Optional project numeric ID."),
  epicId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Optional Epic ID filter to restrict tasks to a specific epic."
    ),
  status: z
    .string()
    .trim()
    .optional()
    .describe(
      "Optional status filter (e.g. 'APPROVED' or 'OPEN'). By default, returns APPROVED features and OPEN bugs."
    ),
  ticketType: z
    .enum(["FEATURE", "BUG", "ALL"])
    .default("ALL")
    .optional()
    .describe(
      "Filter by ticket type: 'FEATURE', 'BUG', or 'ALL' (default is 'ALL')."
    ),
});

export type ListActionableTasksInput = z.infer<
  typeof listActionableTasksInputSchema
>;

/**
 * Zod validation schema for HTTP request body on:
 * PATCH /api/tasks/:id/claim
 */
export const claimTaskBodySchema = z.object({
  ticketType: z.enum(TASK_TYPES, {
    required_error: "Ticket type is required ('FEATURE' or 'BUG')",
    invalid_type_error: "Ticket type must be 'FEATURE' or 'BUG'",
  }),
  agentId: z
    .string()
    .trim()
    .max(100, "Agent ID must be 100 characters or fewer")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional(),
});

export type ClaimTaskBodyInput = z.infer<typeof claimTaskBodySchema>;

/**
 * Zod validation schema for the MCP tool `claim_task`.
 */
export const claimTaskInputSchema = z.object({
  ticketId: z
    .number({
      required_error: "Ticket ID is required",
      invalid_type_error: "Ticket ID must be a positive integer",
    })
    .int()
    .positive("Ticket ID must be a positive integer")
    .describe("The numeric ID of the Feature or Bug to claim."),
  ticketType: z
    .enum(TASK_TYPES, {
      required_error: "Ticket type is required ('FEATURE' or 'BUG')",
      invalid_type_error: "Ticket type must be 'FEATURE' or 'BUG'",
    })
    .describe("The entity type of the ticket: 'FEATURE' or 'BUG'."),
  agentId: z
    .string()
    .trim()
    .max(100)
    .optional()
    .describe(
      "Optional identifier or name of the claiming agent (e.g. 'gemini-coder-1')."
    ),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .describe(
      "Optional notes regarding development intent or claiming context."
    ),
});

export type ClaimTaskInput = z.infer<typeof claimTaskInputSchema>;
