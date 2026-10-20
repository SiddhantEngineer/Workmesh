"use client";

import React from "react";
import { LayoutGrid, ListFilter, PlusCircle, Milestone, Hash } from "lucide-react";
import type { ProjectDetail } from "@workmesh/shared";
import { useProjectTheme, getThemeVariables } from "../../themes";

interface ProjectHeaderProps {
  project: ProjectDetail;
  viewMode: "kanban" | "list";
  onViewModeChange: (mode: "kanban" | "list") => void;
  onCreateEpic?: () => void;
  onProposeFeature?: () => void;
}

export function ProjectHeader({
  project,
  viewMode,
  onViewModeChange,
  onCreateEpic,
  onProposeFeature,
}: ProjectHeaderProps) {
  const totalTickets = (project.nextTicketNumber || 1) - 1;
  const epicsCount = project.epics?.length || 0;
  const featuresCount = project.features?.length || 0;

  const { theme } = useProjectTheme(project.themeId);
  const themeVars = getThemeVariables(theme);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div style={containerStyle}>
      {/* Split Hero Card Header (Inspired by telemetry hero reference) */}
      <div className="hero-entrance" style={{ ...heroCardStyle, ...themeVars }}>
        {/* Left Themed Panel */}
        <div className="themed-hero-left" style={leftPanelStyle}>
          {/* Top Tagline & Date */}
          <div style={topMetaRowStyle}>
            <span style={taglineStyle}>Workspace</span>
            {formattedDate && <span style={dateStyle} className="tabular-nums">{formattedDate}</span>}
          </div>

          {/* Project Title and Key Badge */}
          <div style={titleRowStyle}>
            <h1 style={titleStyle}>{project.name}</h1>
            <span style={keyBadgeStyle}>{project.key}</span>
          </div>

          {/* Description */}
          {project.description && (
            <p style={descriptionStyle}>{project.description}</p>
          )}

          {/* Metadata Badges */}
          <div style={metaPillRowStyle}>
            <div style={metaPillStyle}>
              <span style={metaPillLabelStyle}>Prefix</span>
              <span style={metaPillValueStyle}>{project.key}-#</span>
            </div>
            <div style={metaPillStyle}>
              <span style={metaPillLabelStyle}>Epics</span>
              <span style={metaPillValueStyle} className="tabular-nums">{epicsCount}</span>
            </div>
            <div style={metaPillStyle}>
              <span style={metaPillLabelStyle}>Features</span>
              <span style={metaPillValueStyle} className="tabular-nums">{featuresCount}</span>
            </div>
          </div>
        </div>

        {/* Right Contrasting Telemetry Panel */}
        <div style={rightTelemetryStyle}>
          <div>
            <div style={telemetryHeaderStyle}>
              <span>Ticket Allocation</span>
              <Hash size={13} style={{ opacity: 0.6 }} />
            </div>

            <div style={telemetryNumberRowStyle}>
              <span style={telemetryNumberStyle} className="tabular-nums">{totalTickets}</span>
              <span style={telemetryLabelStyle}>tickets allocated</span>
            </div>
          </div>

          <div style={telemetryActionColStyle}>
            {onCreateEpic && (
              <button
                onClick={onCreateEpic}
                className="btn-secondary"
                style={secondaryButtonStyle}
              >
                <Milestone size={14} />
                <span>+ Create Epic</span>
              </button>
            )}

            {onProposeFeature && (
              <button
                onClick={onProposeFeature}
                className="btn-primary"
                style={proposeButtonStyle}
              >
                <PlusCircle size={15} />
                <span>+ Propose Feature</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar: Kanban vs List View Switcher */}
      <div style={subBarStyle}>
        <div style={switcherContainerStyle}>
          <button
            onClick={() => onViewModeChange("kanban")}
            className="view-switcher-button"
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
            className="view-switcher-button"
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
  paddingBottom: "var(--space-2)",
};

const heroCardStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid var(--theme-card-border)",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
};

const leftPanelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 320,
  backgroundColor: "var(--theme-card-bg)",
  color: "var(--theme-card-text)",
  padding: "24px 28px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const topMetaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "0.78rem",
  fontFamily: "var(--font-primary)",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  opacity: 0.85,
};

const taglineStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--theme-card-muted)",
};

const dateStyle: React.CSSProperties = {
  fontWeight: 500,
  color: "var(--theme-card-muted)",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.85rem",
  fontWeight: 700,
  color: "var(--theme-card-text)",
  letterSpacing: "-0.025em",
  lineHeight: 1.2,
};

const keyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-primary)",
  fontSize: "0.80rem",
  fontWeight: 600,
  backgroundColor: "color-mix(in srgb, var(--theme-card-text) 10%, transparent)",
  border: "1px solid var(--theme-card-border)",
  color: "var(--theme-card-text)",
  padding: "2px 8px",
  borderRadius: 4,
  letterSpacing: "-0.01em",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "0.94rem",
  color: "var(--theme-card-muted)",
  lineHeight: 1.55,
  maxWidth: 720,
};

const metaPillRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  paddingTop: 4,
};

const metaPillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  backgroundColor: "color-mix(in srgb, var(--theme-card-text) 8%, transparent)",
  border: "1px solid var(--theme-card-border)",
  padding: "4px 10px",
  borderRadius: 5,
  fontSize: "0.78rem",
};

const metaPillLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-primary)",
  fontSize: "0.74rem",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  opacity: 0.8,
};

const metaPillValueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--theme-card-text)",
};

const rightTelemetryStyle: React.CSSProperties = {
  width: 260,
  minWidth: 220,
  backgroundColor: "#0D1722",
  color: "#FFFFFF",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 20,
  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
};

const telemetryHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "0.78rem",
  fontFamily: "var(--font-primary)",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "rgba(255, 255, 255, 0.75)",
  marginBottom: 10,
};

const telemetryNumberRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
};

const telemetryNumberStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  fontWeight: 700,
  lineHeight: 1,
  color: "#FFFFFF",
  fontFamily: "var(--font-display)",
};

const telemetryLabelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "rgba(255, 255, 255, 0.6)",
};

const telemetryActionColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#FFFFFF",
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "0.82rem",
  fontWeight: 600,
  border: "1px solid rgba(255, 255, 255, 0.16)",
  cursor: "pointer",
  width: "100%",
  transition: "background-color var(--duration-fast) ease, border-color var(--duration-fast) ease, transform var(--duration-instant) var(--ease-editorial)",
};

const proposeButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "9px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "0.84rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  width: "100%",
  transition: "background-color var(--duration-fast) ease, transform var(--duration-instant) var(--ease-editorial)",
};

const subBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  paddingTop: 4,
};

const switcherContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: 3,
  gap: 2,
};

const switcherButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  border: "none",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color var(--duration-fast) ease, color var(--duration-fast) ease, transform var(--duration-instant) var(--ease-editorial)",
};
