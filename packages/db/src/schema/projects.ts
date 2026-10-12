import { pgTable, serial, varchar, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { themes } from "./themes";

/**
 * Projects Table
 * Top-level workspace/project container managing the shared ticket sequence.
 */
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    // Short key used for ticket prefixing (e.g. "WM" for WM-1, WM-2)
    key: varchar("key", { length: 10 }).notNull(),
    description: text("description"),

    // Foreign key to themes table; every project must belong to a theme
    themeId: integer("theme_id")
      .notNull()
      .references(() => themes.id),

    // Atomic counter for project-scoped ticket numbers
    nextTicketNumber: integer("next_ticket_number").default(1).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete
  },
  (table) => [
    // Partial unique index so soft-deleted project keys can be reclaimed or recreated cleanly
    uniqueIndex("projects_key_active_idx")
      .on(table.key)
      .where(sql`deleted_at IS NULL`),
  ]
);

