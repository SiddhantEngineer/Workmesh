"use client";

import React from "react";
import Link from "next/link";
import { FolderPlus, Layers } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

interface TopNavProps {
  onNewProject?: () => void;
  actions?: React.ReactNode;
}

export function TopNav({ onNewProject, actions }: TopNavProps) {
  return (
    <header style={navStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={logoBadgeStyle}>
            <Layers size={18} color="#3b82f6" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Workmesh
            </h1>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Agent-First Ticket Management
            </p>
          </div>
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
    </header>
  );
}

const navStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  borderBottom: "1px solid var(--border-subtle)",
  backgroundColor: "var(--surface-raised)",
};

const logoBadgeStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 6,
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
