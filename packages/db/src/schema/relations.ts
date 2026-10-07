import { relations } from "drizzle-orm";
import { projects } from "./projects";
import { epics } from "./epics";
import { features } from "./features";
import { bugs } from "./bugs";

// ==========================================
// DRIZZLE RELATIONS (Centralized graph)
// ==========================================

export const projectsRelations = relations(projects, ({ many }) => ({
  epics: many(epics),
  features: many(features),
  bugs: many(bugs),
}));

export const epicsRelations = relations(epics, ({ one, many }) => ({
  project: one(projects, {
    fields: [epics.projectId],
    references: [projects.id],
  }),
  features: many(features),
  bugs: many(bugs),
}));

export const featuresRelations = relations(features, ({ one, many }) => ({
  project: one(projects, {
    fields: [features.projectId],
    references: [projects.id],
  }),
  epic: one(epics, {
    fields: [features.epicId],
    references: [epics.id],
  }),
  bugs: many(bugs),
}));

export const bugsRelations = relations(bugs, ({ one }) => ({
  project: one(projects, {
    fields: [bugs.projectId],
    references: [projects.id],
  }),
  epic: one(epics, {
    fields: [bugs.epicId],
    references: [epics.id],
  }),
  feature: one(features, {
    fields: [bugs.featureId],
    references: [features.id],
  }),
}));
