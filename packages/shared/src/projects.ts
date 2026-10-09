import { z } from "zod";

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
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string | null;
  nextTicketNumber: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
