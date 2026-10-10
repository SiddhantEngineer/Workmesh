import type { Priority, FeatureStatus } from "./enums";

export interface AcceptanceCriterion {
  text: string;
  completed: boolean;
}

/**
 * Lightweight summary of a Feature for Kanban board and project listing views.
 * Distinct from the database entity to allow view-specific metrics/counters in the future.
 */
export interface FeatureSummary {
  id: number;
  projectId: number;
  epicId: number;
  ticketNumber: number;
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
  title: string;
  description: string;
  priority: Priority;
  status: FeatureStatus;
  acceptanceCriteria: AcceptanceCriterion[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
