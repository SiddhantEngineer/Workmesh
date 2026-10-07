import { pgTable, serial, varchar, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { priorityEnum, bugStatusEnum } from "./enums";
import { projects } from "./projects";
import { epics } from "./epics";
import { features } from "./features";

/**
 * Bugs Table
 * Defects filed during human testing or standalone discovery.
 */
export const bugs = pgTable("bugs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  // Optional links: can reference an epic, a feature, or remain standalone in the project
  epicId: integer("epic_id")
    .references(() => epics.id, { onDelete: "set null" }),
  featureId: integer("feature_id")
    .references(() => features.id, { onDelete: "set null" }),

  // Project-scoped ticket number (e.g. 3 -> WM-3)
  ticketNumber: integer("ticket_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  reproductionSteps: text("reproduction_steps"),
  priority: priorityEnum("priority").default("HIGH").notNull(),
  status: bugStatusEnum("status").default("OPEN").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
}, (table) => [
  uniqueIndex("bugs_project_ticket_number_idx").on(table.projectId, table.ticketNumber),
]);
