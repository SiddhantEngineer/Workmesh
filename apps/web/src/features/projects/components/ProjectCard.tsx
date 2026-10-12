"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";
import type { Project } from "@workmesh/shared";
import { useProjectTheme, getThemeVariables } from "../../themes";
import { Spinner } from "../../../components/ui/Spinner";

interface ProjectCardProps {
  project: Project;
  index?: number;
  isOpening?: boolean;
  isDisabled?: boolean;
  onSelect?: (project: Project) => void;
}

export function ProjectCard({
  project,
  index = 0,
  isOpening = false,
  isDisabled = false,
  onSelect,
}: ProjectCardProps) {
  const { theme } = useProjectTheme(project.themeId);
  const themeVars = getThemeVariables(theme);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const totalTickets = (project.nextTicketNumber || 1) - 1;

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled || isOpening) {
      e.preventDefault();
      return;
    }
    onSelect?.(project);
  };

  return (
    <Link
      href={`/projects/${project.key}`}
      prefetch={true}
      onClick={handleClick}
      className="project-card"
      style={{
        ...themeVars,
        animationDelay: `${index * 0.05}s`,
        cursor: isDisabled ? "not-allowed" : isOpening ? "progress" : "pointer",
        opacity: isDisabled ? 0.45 : isOpening ? 0.88 : 1,
        pointerEvents: isDisabled ? "none" : "auto",
      }}
    >
      {/* Top Header Tagline & Meta */}
      <div style={cardHeaderRowStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={keyBadgeStyle}>{project.key}</span>
          <span style={cardTaglineStyle}>WORKSPACE // {project.key}</span>
        </div>
        <div style={cardTopMetaStyle}>
          {formattedDate && <span>{formattedDate}</span>}
          <span>•</span>
          <span>{totalTickets} tickets allocated</span>
        </div>
      </div>

      {/* Hero Project Title (Large commanding typography as in reference screenshot) */}
      <h3 style={heroTitleStyle}>{project.name}</h3>

      {/* Description */}
      <p style={cardDescriptionStyle}>
        {project.description || "No description provided."}
      </p>

      {/* Footer Details & Action Button */}
      <div style={cardFooterStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--theme-card-muted)" }}>
          <Terminal size={14} />
          <span>Prefix: <strong style={{ color: "var(--theme-card-text)" }}>{project.key}-#</strong></span>
        </div>

        <div style={cardLinkStyle}>
          {isOpening ? (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Spinner size="xs" color="var(--theme-card-text)" />
              <span>Opening workspace...</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>Open Board</span>
              <span className="card-arrow" style={{ display: "inline-flex" }}>
                <ArrowRight size={15} />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const cardHeaderRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  flexWrap: "wrap",
  gap: 8,
};

const keyBadgeStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--theme-card-text) 10%, transparent)",
  border: "1px solid var(--theme-card-border)",
  color: "var(--theme-card-text)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  fontWeight: 700,
  padding: "3px 8px",
  borderRadius: 4,
};

const cardTaglineStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--theme-card-muted)",
};

const cardTopMetaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "0.78rem",
  color: "var(--theme-card-muted)",
  fontFamily: "var(--font-mono)",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "2.1rem",
  fontWeight: 700,
  letterSpacing: "-0.035em",
  lineHeight: 1.15,
  color: "var(--theme-card-text)",
  marginTop: 6,
  marginBottom: 4,
};

const cardDescriptionStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "var(--theme-card-muted)",
  lineHeight: 1.6,
  maxWidth: "80ch",
};

const cardFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 18,
  marginTop: 8,
  borderTop: "1px solid var(--theme-card-border)",
};

const cardLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.88rem",
  fontWeight: 600,
  color: "var(--theme-card-text)",
};
