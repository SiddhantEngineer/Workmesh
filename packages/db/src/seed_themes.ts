import { resolve } from "node:path";
import * as dotenv from "dotenv";

// Load .env from workspace root
dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

import { db } from "./client";
import { themes } from "./schema/themes";
import { eq } from "drizzle-orm";

const UPDATES = [
  { key: "flora-blue", tokens: { card: { bgLight: "#F0F5FA", textLight: "#0C2338", bgDark: "#121B24", textDark: "#E2F1F8" } } },
  { key: "classic-slate", tokens: { card: { bgLight: "#FFFFFF", textLight: "#0C0C09", bgDark: "#161613", textDark: "#F4F4F0" } } },
  { key: "sage-forest", tokens: { card: { bgLight: "#F1F6F2", textLight: "#0D2B17", bgDark: "#111E15", textDark: "#E2F5E7" } } },
  { key: "sunset-warmth", tokens: { card: { bgLight: "#FBF7F5", textLight: "#2E1A12", bgDark: "#1B1411", textDark: "#F5F3F0" } } },
  { key: "velvet-orchid", tokens: { card: { bgLight: "#F6F2FA", textLight: "#26133B", bgDark: "#1A1324", textDark: "#F3EEF9" } } },
];

async function run() {
  for (const item of UPDATES) {
    const res = await db.update(themes).set({ tokens: item.tokens }).where(eq(themes.key, item.key)).returning();
    console.log("Updated", item.key, res.length > 0 ? "SUCCESS" : "NOT FOUND");
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
