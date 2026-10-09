"use client";

import React, { useState } from "react";
import { TopNav } from "../components/layout/TopNav";
import { ProjectList } from "../features/projects/components/ProjectList";
import { CreateProjectModal } from "../features/projects/components/CreateProjectModal";
import { useProjectsQuery } from "../features/projects/queries";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: projects = [], isLoading } = useProjectsQuery();

  return (
    <div style={containerStyle}>
      <TopNav onNewProject={() => setIsModalOpen(true)} />

      <main style={mainContentStyle}>
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          onCreateProject={() => setIsModalOpen(true)}
        />
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: 1140,
  width: "100%",
  margin: "0 auto",
  padding: "32px 24px",
};
