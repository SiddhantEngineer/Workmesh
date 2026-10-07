import { pgTable, serial, varchar, text, integer, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { priorityEnum, featureStatusEnum, type AcceptanceCriterion } from "./enums";
import { projects } from "./projects";
import { epics } from "./epics";

/**
 * Features Table
 * Actionable units of work decomposed from Epics.
 */
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  epicId: integer("epic_id")
    .references(() => epics.id, { onDelete: "cascade" })
    .notNull(),

  // Project-scoped ticket number (e.g. 2 -> WM-2)
  ticketNumber: integer("ticket_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: priorityEnum("priority").default("MEDIUM").notNull(),
  status: featureStatusEnum("status").default("PROPOSED").notNull(),

  // Structured checklist of criteria items
  acceptanceCriteria: jsonb("acceptance_criteria")
    .$type<AcceptanceCriterion[]>()
    .default([])
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
}, (table) => [
  uniqueIndex("features_project_ticket_number_idx").on(table.projectId, table.ticketNumber),
]);
