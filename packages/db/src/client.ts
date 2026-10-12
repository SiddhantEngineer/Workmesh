import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";
import * as dotenv from "dotenv";

// Load environment variables from current directory or monorepo root
dotenv.config();
dotenv.config({ path: "../../.env" });

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/workmesh";

/**
 * 1. Low-level PostgreSQL client
 * 'postgres' (porsager/postgres) manages connection pooling automatically.
 */
export const pgClient = postgres(connectionString);

/**
 * 2. Drizzle ORM instance
 * Passing '{ schema }' enables Drizzle's relational query API:
 * e.g., db.query.projects.findMany({ with: { epics: true } })
 */
export const db = drizzle(pgClient, { schema });

export type DB = typeof db;
