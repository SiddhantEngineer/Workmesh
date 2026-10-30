import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";
import * as dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// Load environment variables reliably regardless of process.cwd()
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const possibleEnvPaths = [
  path.resolve(currentDir, "../../../.env"),
  path.resolve(currentDir, "../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config();

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
