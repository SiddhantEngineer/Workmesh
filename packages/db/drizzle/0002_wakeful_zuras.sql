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
('flora-blue', 'Flora Blue', '{"card": {"bgLight": "#D0E2EC", "textLight": "#0C1E28", "bgDark": "#132B3A", "textDark": "#E0F0F8"}}'::jsonb),
('classic-slate', 'Classic Slate', '{"card": {"bgLight": "#FFFFFF", "textLight": "#0C0C09", "bgDark": "#161612", "textDark": "#F4F4F1"}}'::jsonb),
('sage-forest', 'Sage Forest', '{"card": {"bgLight": "#DCE8DC", "textLight": "#142617", "bgDark": "#142918", "textDark": "#E2F3E4"}}'::jsonb),
('sunset-warmth', 'Sunset Warmth', '{"card": {"bgLight": "#FCE8DD", "textLight": "#331608", "bgDark": "#33180D", "textDark": "#FCEEE5"}}'::jsonb),
('velvet-orchid', 'Velvet Orchid', '{"card": {"bgLight": "#EDE4F5", "textLight": "#251036", "bgDark": "#251236", "textDark": "#F4EDFA"}}'::jsonb)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "theme_id" integer;
--> statement-breakpoint
UPDATE "projects" SET "theme_id" = 1 WHERE "theme_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "theme_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;