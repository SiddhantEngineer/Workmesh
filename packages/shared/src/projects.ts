import { z } from "zod";
import type { EpicSummary } from "./epics";
import type { FeatureSummary } from "./features";

/**
 * Validation schema for creating a new Project.
 * Used across Hono API endpoints, MCP tools, and Next.js forms.
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(255, "Project name must be 255 characters or fewer"),

  // Project prefix key for ticket numbering (e.g. "WM" generates "WM-1", "WM-2")
  key: z
    .string()
    .trim()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key cannot exceed 10 characters")
    .regex(/^[A-Za-z0-9]+$/, "Project key must be alphanumeric")
    .transform((val) => val.toUpperCase()),

  description: z.string().trim().max(2000).optional(),

  // Theme ID assigned to this project
  themeId: z
    .number({
      required_error: "Please select a theme for this project",
      invalid_type_error: "Theme must be selected",
    })
    .int()
    .positive("Please select a valid theme"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string | null;
  themeId: number;
  nextTicketNumber: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}

/**
 * Project Detail for Project Hub / listing page:
 * Contains lightweight summaries of epics and features instead of heavy full entities.
 */
export interface ProjectDetail extends Project {
  epics: EpicSummary[];
  features: FeatureSummary[];
}

/**
 * Input schema for fetching project context (via MCP tool or internal API).
 * Optimized to protect LLM context windows against large roadmaps.
 */
export const getProjectContextInputSchema = {
  projectKey: z
    .string()
    .trim()
    .optional()
    .describe(
      "The uppercase key prefix of the project (e.g. 'WM'). Required if projectId is not provided."
    ),
  projectId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "The internal integer ID of the project. Required if projectKey is not provided."
    ),
  epicLimit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20)
    .describe("Maximum number of active epics to return (default 20, max 50)"),
  includeDescriptions: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to include full epic descriptions (default false to conserve context window)"),
};

export const getProjectContextSchema = z.object(getProjectContextInputSchema);
export type GetProjectContextInput = z.infer<typeof getProjectContextSchema>;

export interface ActiveEpicSummary {
  id: number;
  key: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  description?: string; // Only populated if includeDescriptions is true
}

export interface ProjectContextSummary {
  project: {
    id: number;
    name: string;
    key: string;
    description: string | null;
    nextTicketNumber: number;
  };
  epicsCount: {
    total: number;
    active: number;
  };
  activeEpics: ActiveEpicSummary[];
  hasMoreEpics: boolean;
  stats?: {
    totalFeatures: number;
    proposedFeatures: number;
    approvedFeatures: number;
    inProgressFeatures: number;
    readyForTestFeatures: number;
    closedFeatures: number;
    openBugs: number;
  };
}


