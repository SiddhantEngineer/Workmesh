import { pgTable, serial, varchar, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { priorityEnum, epicStatusEnum } from "./enums";
import { projects } from "./projects";

/**
 * Epics Table
 * High-level initiatives proposed by AI agents or human users.
 */
export const epics = pgTable("epics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),

  // Project-scoped ticket number (e.g. 1 -> WM-1)
  ticketNumber: integer("ticket_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: priorityEnum("priority").default("HIGH").notNull(),
  status: epicStatusEnum("status").default("PROPOSED").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
}, (table) => [
  uniqueIndex("epics_project_ticket_number_idx").on(table.projectId, table.ticketNumber),
]);
