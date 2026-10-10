import type { Priority, EpicStatus } from "./enums";

/**
 * Lightweight summary of an Epic for project board/list views.
 * Distinct from the database entity to allow view-specific aggregations in the future.
 */
export interface EpicSummary {
  id: number;
  projectId: number;
  ticketNumber: number;
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
  title: string;
  description: string;
  priority: Priority;
  status: EpicStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
