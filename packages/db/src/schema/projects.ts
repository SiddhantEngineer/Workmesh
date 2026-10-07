import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Projects Table
 * Top-level workspace/project container managing the shared ticket sequence.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // Short key used for ticket prefixing (e.g. "WM" for WM-1, WM-2)
  key: varchar("key", { length: 10 }).notNull().unique(),
  description: text("description"),

  // Atomic counter for project-scoped ticket numbers
  nextTicketNumber: integer("next_ticket_number").default(1).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
});
