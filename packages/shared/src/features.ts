import { z } from "zod";
import { PRIORITY_LEVELS, type Priority, type FeatureStatus } from "./enums";

export interface AcceptanceCriterion {
  text: string;
  completed: boolean;
}

/**
 * Zod validation schema for the HTTP request body when creating a Feature.
 */
export const createFeatureBodySchema = z.object({
  epicId: z
    .number({
      required_error: "Please select a parent Epic",
      invalid_type_error: "Parent Epic ID must be a number",
    })
    .int()
    .positive("Please select a valid parent Epic"),
  title: z
    .string()
    .trim()
    .min(1, "Feature title is required")
    .max(255, "Feature title must be 255 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(10000, "Feature description must be 10000 characters or fewer")
    .default(""),
  priority: z.enum(PRIORITY_LEVELS).default("MEDIUM"),
  acceptanceCriteria: z
    .array(z.string().trim().min(1, "Criterion cannot be empty"))
    .min(1, "At least one acceptance criterion is required"),
});

export type CreateFeatureBodyInput = z.infer<typeof createFeatureBodySchema>;

/**
 * Zod validation schema for approving a feature.
 * Optional notes can be supplied by the human operator.
 */
export const approveFeatureBodySchema = z.object({
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional(),
});

export type ApproveFeatureBodyInput = z.infer<typeof approveFeatureBodySchema>;

/**
 * Zod validation schema for rejecting a feature.
 * A non-empty rejection reason is required so agents or team members know why it was rejected.
 */
export const rejectFeatureBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(1000, "Rejection reason must be 1000 characters or fewer"),
});

export type RejectFeatureBodyInput = z.infer<typeof rejectFeatureBodySchema>;

/**
 * Raw shape schema for MCP tools or direct service invocations.
 */
export const createFeatureInputSchema = {
  projectKey: z
    .string()
    .trim()
    .optional()
    .describe("Uppercase key prefix of the project (e.g. 'WM'). If omitted, inferred from epic."),
  projectId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Internal integer ID of the project. If omitted, inferred from epic."),
  epicId: z
    .number()
    .int()
    .positive()
    .describe("Internal integer ID of the parent Epic that this Feature decomposes"),
  title: z
    .string()
    .trim()
    .min(1, "Feature title is required")
    .max(255, "Feature title must be 255 characters or fewer")
    .describe("Concise title of the actionable feature"),
  description: z
    .string()
    .trim()
    .max(10000, "Feature description must be 10000 characters or fewer")
    .optional()
    .default("")
    .describe("Detailed technical description and implementation scope"),
  priority: z
    .enum(PRIORITY_LEVELS)
    .optional()
    .default("MEDIUM")
    .describe("Priority level (LOW | MEDIUM | HIGH | CRITICAL). Defaults to MEDIUM."),
  acceptanceCriteria: z
    .array(z.string().trim().min(1, "Criterion cannot be empty"))
    .min(1, "At least one acceptance criterion is required")
    .describe("Verifiable checklist items required for feature sign-off"),
};

export const createFeatureSchema = z.object(createFeatureInputSchema);
export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;

/**
 * Lightweight summary of a Feature for Kanban board and project listing views.
 * Distinct from the database entity to allow view-specific metrics/counters in the future.
 */
export interface FeatureSummary {
  id: number;
  projectId: number;
  epicId: number;
  ticketNumber: number;
  key?: string; // Formatted ticket key e.g. "WM-2"
  title: string;
  priority: Priority;
  status: FeatureStatus;
  acceptanceCriteria: AcceptanceCriterion[];
}

/**
 * Full Feature data model representing the persistent entity for detail views.
 */
export interface Feature {
  id: number;
  projectId: number;
  epicId: number;
  ticketNumber: number;
  key?: string; // Formatted ticket key e.g. "WM-2"
  title: string;
  description: string;
  priority: Priority;
  status: FeatureStatus;
  acceptanceCriteria: AcceptanceCriterion[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
