import { pgTable, serial, integer, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { entityTypeEnum } from "./enums";

export type ActivityActor = {
  type: "HUMAN" | "AGENT";
  name?: string;
};

export type ActivityLogDetails = {
  actor?: ActivityActor;
  previousStatus?: string;
  nextStatus?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Activity Logs Table
 * 
 * Provides an append-only audit trail and event stream for all actions performed
 * by humans and AI agents across projects, epics, features, and bugs.
 */
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),

    // Scoped to a project so that frontend SSE listeners can filter by project ID
    projectId: integer("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),

    // Polymorphic reference: which entity type is being affected
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),

    // Action verb describing what occurred
    action: varchar("action", { length: 50 }).notNull(), // e.g. 'PROPOSED', 'APPROVED', 'CLAIMED', 'SUBMITTED_FOR_REVIEW', 'REJECTED', 'CLOSED'

    // Flexible metadata for event payloads (actor attribution, status changes, notes)
    details: jsonb("details").$type<ActivityLogDetails>().default({}),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Fast lookup for project-level live event feeds
    index("activity_logs_project_id_idx").on(table.projectId),
    // Fast lookup for entity-level timeline drawer (e.g. show history of Feature #3)
    index("activity_logs_entity_lookup_idx").on(table.entityType, table.entityId),
  ]
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
