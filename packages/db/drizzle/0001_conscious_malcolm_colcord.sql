CREATE TYPE "public"."entity_type" AS ENUM('PROJECT', 'EPIC', 'FEATURE', 'BUG');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_project_id_idx" ON "activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_logs_entity_lookup_idx" ON "activity_logs" USING btree ("entity_type","entity_id");