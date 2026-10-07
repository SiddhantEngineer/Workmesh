CREATE TYPE "public"."bug_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."epic_status" AS ENUM('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."feature_status" AS ENUM('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'READY_FOR_TEST', 'CLOSED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(10) NOT NULL,
	"description" text,
	"next_ticket_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "projects_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "epics" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"ticket_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority" "priority_level" DEFAULT 'HIGH' NOT NULL,
	"status" "epic_status" DEFAULT 'PROPOSED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"epic_id" integer NOT NULL,
	"ticket_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority" "priority_level" DEFAULT 'MEDIUM' NOT NULL,
	"status" "feature_status" DEFAULT 'PROPOSED' NOT NULL,
	"acceptance_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bugs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"epic_id" integer,
	"feature_id" integer,
	"ticket_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"reproduction_steps" text,
	"priority" "priority_level" DEFAULT 'HIGH' NOT NULL,
	"status" "bug_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "epics" ADD CONSTRAINT "epics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_epic_id_epics_id_fk" FOREIGN KEY ("epic_id") REFERENCES "public"."epics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_epic_id_epics_id_fk" FOREIGN KEY ("epic_id") REFERENCES "public"."epics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "epics_project_ticket_number_idx" ON "epics" USING btree ("project_id","ticket_number");--> statement-breakpoint
CREATE UNIQUE INDEX "features_project_ticket_number_idx" ON "features" USING btree ("project_id","ticket_number");--> statement-breakpoint
CREATE UNIQUE INDEX "bugs_project_ticket_number_idx" ON "bugs" USING btree ("project_id","ticket_number");