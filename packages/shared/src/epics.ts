import { z } from "zod";
import { PRIORITY_LEVELS, type Priority, type EpicStatus } from "./enums";

/**
 * Zod validation schema for the HTTP request body when creating an Epic.
 */
export const createEpicBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Epic title is required")
    .max(255, "Epic title must be 255 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(10000, "Epic description must be 10000 characters or fewer")
    .default(""),
  priority: z.enum(PRIORITY_LEVELS).default("HIGH"),
});

export type CreateEpicBodyInput = z.infer<typeof createEpicBodySchema>;

/**
 * Raw shape schema for MCP tools or direct service invocations where the target project
 * can be identified by either projectId or projectKey.
 */
export const createEpicInputSchema = {
  projectId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The internal integer ID of the target project"),
  projectKey: z
    .string()
    .trim()
    .optional()
    .describe("The uppercase key prefix of the target project (e.g. 'WM')"),
  title: z
    .string()
    .trim()
    .min(1, "Epic title is required")
    .max(255, "Epic title must be 255 characters or fewer")
    .describe("Concise title of the milestone or initiative"),
  description: z
    .string()
    .trim()
    .max(10000, "Epic description must be 10000 characters or fewer")
    .optional()
    .default("")
    .describe("Detailed overview of the epic scope and technical goals"),
  priority: z
    .enum(PRIORITY_LEVELS)
    .optional()
    .default("HIGH")
    .describe("Priority level (LOW | MEDIUM | HIGH | CRITICAL). Defaults to HIGH."),
};

export const createEpicSchema = z.object(createEpicInputSchema);
export type CreateEpicInput = z.infer<typeof createEpicSchema>;

/**
 * Lightweight summary of an Epic for project board/list views.
 * Distinct from the database entity to allow view-specific aggregations in the future.
 */
export interface EpicSummary {
  id: number;
  projectId: number;
  ticketNumber: number;
  key?: string; // Formatted ticket key e.g. "WM-1"
  title: string;
  status: EpicStatus;
}

/**
 * Full Epic data model representing the persistent entity for detail views.
 */
export interface Epic {
  id: number;
  projectId: number;
  ticketNumber: number;
  key?: string; // Formatted ticket key e.g. "WM-1"
  title: string;
  description: string;
  priority: Priority;
  status: EpicStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}

