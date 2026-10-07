import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from the root .env file
dotenv.config({ path: "../../.env" });

export default defineConfig({
  // 1. Where our TypeScript table definitions live
  schema: "./src/schema/index.ts",

  // 2. Where generated SQL migration files will be saved
  out: "./drizzle",

  // 3. Database dialect we are targeting
  dialect: "postgresql",

  // 4. Connection credentials used by drizzle-kit commands
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/workmesh",
  },

  // 5. Safety checks
  verbose: true, // Prints detailed SQL queries during CLI commands
  strict: true,  // Prompts for confirmation when performing destructive changes
});
