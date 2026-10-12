"use client";

import React from "react";
import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

interface TopNavProps {
  onNewProject?: () => void;
  actions?: React.ReactNode;
}

export function TopNav({ onNewProject, actions }: TopNavProps) {
  return (
    <header style={headerWrapperStyle}>
      <div style={navInnerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            className="brand-link"
          >
            <span style={brandTitleStyle}>
              Workmesh
            </span>
            <span style={brandSubtitleStyle}>
              Agent-First Ticket Management
            </span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {actions}
          <ThemeToggle />
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="btn-primary"
              style={newProjectButtonStyle}
            >
              <FolderPlus size={16} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const headerWrapperStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--surface)",
};

const navInnerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 0",
  borderBottom: "1px solid var(--border-subtle)",
  maxWidth: 1200,
  margin: "0 auto",
  width: "100%",
};

const brandTitleStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  color: "var(--text-primary)",
};

const brandSubtitleStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "var(--text-muted)",
  letterSpacing: "0.01em",
};

const newProjectButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "8px 14px",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
};
