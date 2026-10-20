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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Bespoke Workmesh Monogram/Symbol */}
              <div style={brandIconWrapperStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L12 2L20 6V18L12 22L4 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <span style={brandTitleStyle}>
                  Workmesh
                </span>
                <span style={brandSubtitleStyle}>
                  Agent-First Ticket Management
                </span>
              </div>
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
            >
              <FolderPlus size={15} />
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
  padding: "16px 0",
  borderBottom: "1px solid var(--border-subtle)",
  maxWidth: 1440,
  margin: "0 auto",
  width: "100%",
};

const brandIconWrapperStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const brandTitleStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  color: "var(--text-primary)",
  display: "block",
  lineHeight: 1.2,
};

const brandSubtitleStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "var(--text-secondary)",
  letterSpacing: "-0.01em",
  display: "block",
};
