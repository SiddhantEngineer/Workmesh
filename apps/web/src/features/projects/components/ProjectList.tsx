"use client";

import React from "react";
import { FolderPlus, Layers } from "lucide-react";
import type { Project } from "@workmesh/shared";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onCreateProject: () => void;
  onSelectProject?: (project: Project) => void;
}

export function ProjectList({
  projects,
  isLoading,
  onCreateProject,
  onSelectProject,
}: ProjectListProps) {
  return (
    <div>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Projects
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: 4 }}>
          Select a workspace or create a new project to start collaborating with agents
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={emptyStateStyle}>
          <p style={{ color: "var(--text-secondary)" }}>Loading projects...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={emptyIconCircleStyle}>
            <Layers size={32} color="#64748b" />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginTop: 16 }}>
            No projects yet
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: 420, marginTop: 6 }}>
            Get started by creating your first project workspace. AI agents can then connect via MCP to decompose epics and propose features.
          </p>
          <button
            onClick={onCreateProject}
            className="btn-primary"
            style={createButtonStyle}
          >
            <FolderPlus size={16} />
            <span>Create First Project</span>
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && projects.length > 0 && (
        <div style={gridStyle}>
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: 24,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 16,
};

const emptyStateStyle: React.CSSProperties = {
  padding: "64px 20px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px dashed var(--border-subtle)",
  borderRadius: 8,
};

const emptyIconCircleStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const createButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
  marginTop: 20,
};
