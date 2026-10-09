"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";
import type { Project } from "@workmesh/shared";

interface ProjectCardProps {
  project: Project;
  index?: number;
  onSelect?: (project: Project) => void;
}

export function ProjectCard({ project, index = 0, onSelect }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.key}`}
      onClick={() => onSelect?.(project)}
      className="project-card"
      style={{
        ...cardStyle,
        textDecoration: "none",
        color: "inherit",
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={keyBadgeStyle}>
          <span>{project.key}</span>
        </div>
        <span style={ticketCountStyle}>
          {(project.nextTicketNumber || 1) - 1} tickets
        </span>
      </div>

      <h3 style={cardTitleStyle}>{project.name}</h3>

      <p style={cardDescriptionStyle}>
        {project.description || "No description provided."}
      </p>

      <div style={cardFooterStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <Terminal size={12} />
          <span>Prefix: <strong>{project.key}-#</strong></span>
        </div>
        <div style={cardLinkStyle}>
          <span>Open Board</span>
          <span className="card-arrow" style={{ display: "inline-flex" }}>
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  cursor: "pointer",
};

const keyBadgeStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  fontWeight: 700,
  padding: "2px 6px",
  borderRadius: 4,
};

const ticketCountStyle: React.CSSProperties = {
  fontSize: "0.76rem",
  color: "var(--text-muted)",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const cardDescriptionStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--text-secondary)",
  lineHeight: 1.5,
  flex: 1,
  minHeight: 38,
};

const cardFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 12,
  borderTop: "1px solid var(--border-subtle)",
};

const cardLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--accent-primary)",
};
