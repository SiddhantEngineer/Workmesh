import { pgEnum } from "drizzle-orm/pg-core";

// ==========================================
// 1. POSTGRESQL ENUMS
// ==========================================

export const priorityEnum = pgEnum("priority_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const epicStatusEnum = pgEnum("epic_status", [
  "PROPOSED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
]);

export const featureStatusEnum = pgEnum("feature_status", [
  "PROPOSED",
  "APPROVED",
  "IN_PROGRESS",
  "READY_FOR_TEST",
  "CLOSED",
  "REJECTED",
]);

export const bugStatusEnum = pgEnum("bug_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

// ==========================================
// 2. TYPES
// ==========================================

export type Priority = (typeof priorityEnum.enumValues)[number];
export type EpicStatus = (typeof epicStatusEnum.enumValues)[number];
export type FeatureStatus = (typeof featureStatusEnum.enumValues)[number];
export type BugStatus = (typeof bugStatusEnum.enumValues)[number];

export type AcceptanceCriterion = {
  text: string;
  completed: boolean;
};
