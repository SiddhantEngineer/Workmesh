CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"tokens" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "themes_key_unique" UNIQUE("key")
);
--> statement-breakpoint
INSERT INTO "themes" ("key", "name", "tokens") VALUES
('flora-blue', 'Flora Blue', '{"card": {"bgLight": "#F0F5FA", "textLight": "#0C2338", "bgDark": "#121B24", "textDark": "#E2F1F8"}}'::jsonb),
('classic-slate', 'Classic Slate', '{"card": {"bgLight": "#FFFFFF", "textLight": "#0C0C09", "bgDark": "#161613", "textDark": "#F4F4F0"}}'::jsonb),
('sage-forest', 'Sage Forest', '{"card": {"bgLight": "#F1F6F2", "textLight": "#0D2B17", "bgDark": "#111E15", "textDark": "#E2F5E7"}}'::jsonb),
('sunset-warmth', 'Sunset Warmth', '{"card": {"bgLight": "#FBF7F5", "textLight": "#2E1A12", "bgDark": "#1B1411", "textDark": "#F5F3F0"}}'::jsonb),
('velvet-orchid', 'Velvet Orchid', '{"card": {"bgLight": "#F6F2FA", "textLight": "#26133B", "bgDark": "#1A1324", "textDark": "#F3EEF9"}}'::jsonb)
ON CONFLICT ("key") DO UPDATE SET "tokens" = EXCLUDED."tokens", "name" = EXCLUDED."name";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "theme_id" integer;
--> statement-breakpoint
UPDATE "projects" SET "theme_id" = 1 WHERE "theme_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "theme_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;