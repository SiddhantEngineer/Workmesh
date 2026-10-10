"use client";

import React from "react";
import { LayoutGrid, ListFilter, PlusCircle, Hash } from "lucide-react";
import type { ProjectDetail } from "@workmesh/shared";

interface ProjectHeaderProps {
  project: ProjectDetail;
  viewMode: "kanban" | "list";
  onViewModeChange: (mode: "kanban" | "list") => void;
  onProposeFeature?: () => void;
}

export function ProjectHeader({
  project,
  viewMode,
  onViewModeChange,
  onProposeFeature,
}: ProjectHeaderProps) {
  const totalTickets = (project.nextTicketNumber || 1) - 1;
  const epicsCount = project.epics?.length || 0;
  const featuresCount = project.features?.length || 0;

  return (
    <div style={containerStyle}>
      {/* Main Header Content */}
      <div style={mainRowStyle}>
        <div style={titleGroupStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={titleStyle}>{project.name}</h1>
            <span style={keyBadgeStyle}>{project.key}</span>
          </div>
          {project.description && (
            <p style={descriptionStyle}>{project.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        {onProposeFeature && (
          <div style={actionGroupStyle}>
            <button
              onClick={onProposeFeature}
              className="btn-primary"
              style={proposeButtonStyle}
            >
              <PlusCircle size={16} />
              <span>+ Propose Feature</span>
            </button>
          </div>
        )}
      </div>

      {/* Metadata & View Switcher Bar */}
      <div style={subBarStyle}>
        <div style={statsContainerStyle}>
          <div style={statItemStyle}>
            <Hash size={13} style={{ color: "var(--text-muted)" }} />
            <span>
              <strong>{totalTickets}</strong> tickets allocated
            </span>
          </div>
          <span style={statDividerStyle}>•</span>
          <div style={statItemStyle}>
            <span>
              <strong>{epicsCount}</strong> epics
            </span>
          </div>
          <span style={statDividerStyle}>•</span>
          <div style={statItemStyle}>
            <span>
              <strong>{featuresCount}</strong> features
            </span>
          </div>
        </div>

        {/* View Switcher: Kanban vs List */}
        <div style={switcherContainerStyle}>
          <button
            onClick={() => onViewModeChange("kanban")}
            style={{
              ...switcherButtonStyle,
              backgroundColor:
                viewMode === "kanban" ? "var(--surface-raised)" : "transparent",
              color:
                viewMode === "kanban" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow:
                viewMode === "kanban" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <LayoutGrid size={15} />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            style={{
              ...switcherButtonStyle,
              backgroundColor:
                viewMode === "list" ? "var(--surface-raised)" : "transparent",
              color:
                viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow:
                viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <ListFilter size={15} />
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  paddingBottom: "var(--space-4)",
  borderBottom: "1px solid var(--border-subtle)",
};

const mainRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
};

const titleGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  flex: 1,
  minWidth: 260,
};

const keyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  fontWeight: 700,
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  padding: "3px 8px",
  borderRadius: 4,
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "0.92rem",
  color: "var(--text-secondary)",
  lineHeight: 1.5,
  maxWidth: 720,
};

const actionGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const proposeButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "8px 14px",
  borderRadius: 6,
  fontSize: "0.84rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};

const subBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  paddingTop: 8,
};

const statsContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "0.82rem",
  color: "var(--text-secondary)",
};

const statItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const statDividerStyle: React.CSSProperties = {
  color: "var(--border-subtle)",
};

const switcherContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  padding: 3,
  gap: 2,
};

const switcherButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  border: "none",
  borderRadius: 4,
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s ease",
};
