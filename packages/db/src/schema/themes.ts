import { pgTable, serial, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

/**
 * Shape of extensible design tokens for a project theme.
 * Scoped by UI component (starting with `card`), allowing new components
 * (features, bugs, badges) to be added without modifying the database schema.
 */
export interface ThemeTokens {
  card: {
    bgLight: string;
    textLight: string;
    bgDark: string;
    textDark: string;
  };
}

/**
 * Themes Table
 * Stores color token configurations for projects.
 */
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),

  // Stable unique slug for seeding and migrations (e.g., "flora-blue")
  key: varchar("key", { length: 50 }).notNull().unique(),

  // Display name in UI (e.g., "Flora Blue")
  name: varchar("name", { length: 100 }).notNull(),

  // Extensible JSONB storage for component design tokens
  tokens: jsonb("tokens").$type<ThemeTokens>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
