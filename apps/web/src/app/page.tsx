"use client";

import React from "react";
import { ProjectList } from "../features/projects/components/ProjectList";
import { useProjectsQuery } from "../features/projects/queries";
import { useCreateProjectModal } from "../components/layout/AppShell";

export default function HomePage() {
  const { openCreateProject } = useCreateProjectModal();
  const { data: projects = [], isLoading } = useProjectsQuery();

  return (
    <ProjectList
      projects={projects}
      isLoading={isLoading}
      onCreateProject={openCreateProject}
    />
  );
}
