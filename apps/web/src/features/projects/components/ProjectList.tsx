"use client";

import React, { useState } from "react";
import { FolderPlus, Layers } from "lucide-react";
import type { Project } from "@workmesh/shared";
import { ProjectCard } from "./ProjectCard";
import { Spinner } from "../../../components/ui/Spinner";

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
  // Navigation lock: locks all other cards when any card is clicked
  const [openingProjectKey, setOpeningProjectKey] = useState<string | null>(null);

  return (
    <div>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
          Projects
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: 4 }}>
          Select a workspace or create a new project to start collaborating with agents
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={emptyStateStyle}>
          <Spinner size={24} color="var(--accent-primary)" />
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Loading projects...</p>
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

      {/* Full-Width Editorial Projects Stack */}
      {!isLoading && projects.length > 0 && (
        <div style={fullWidthContainerStyle}>
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              isOpening={openingProjectKey === project.key}
              isDisabled={openingProjectKey !== null && openingProjectKey !== project.key}
              onSelect={(p) => {
                setOpeningProjectKey(p.key);
                onSelectProject?.(p);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: 28,
};

const fullWidthContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  width: "100%",
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
