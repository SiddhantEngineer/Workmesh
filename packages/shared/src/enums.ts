export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITY_LEVELS)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const EPIC_STATUSES = [
  "PROPOSED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;
export type EpicStatus = (typeof EPIC_STATUSES)[number];

export const EPIC_STATUS_LABELS: Record<EpicStatus, string> = {
  PROPOSED: "Proposed",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export const FEATURE_STATUSES = [
  "PROPOSED",
  "APPROVED",
  "IN_PROGRESS",
  "READY_FOR_TEST",
  "CLOSED",
  "REJECTED",
] as const;
export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  PROPOSED: "Proposed",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  READY_FOR_TEST: "Ready for Test",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export const BUG_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;
export type BugStatus = (typeof BUG_STATUSES)[number];

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const ENTITY_TYPES = [
  "PROJECT",
  "EPIC",
  "FEATURE",
  "BUG",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
