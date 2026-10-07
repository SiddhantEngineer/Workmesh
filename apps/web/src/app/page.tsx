"use client";

import React, { useEffect, useState } from "react";
import { FolderPlus, Layers, ArrowRight, Sparkles, Terminal } from "lucide-react";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { ThemeToggle } from "../components/ThemeToggle";

interface Project {
  id: number;
  name: string;
  key: string;
  description: string | null;
  nextTicketNumber: number;
  createdAt: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <div style={containerStyle}>
      {/* Top Navbar */}
      <header style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={logoBadgeStyle}>
            <Layers size={18} color="#3b82f6" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Workmesh
            </h1>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Agent-First Ticket Management
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={newProjectButtonStyle}
          >
            <FolderPlus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        <div style={pageHeaderStyle}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Projects
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: 4 }}>
              Select a workspace or create a new project to start collaborating with agents
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={emptyStateStyle}>
            <p style={{ color: "var(--text-secondary)" }}>Loading projects...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
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
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
              style={{ ...newProjectButtonStyle, marginTop: 20 }}
            >
              <FolderPlus size={16} />
              <span>Create First Project</span>
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div style={gridStyle}>
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="project-card"
                style={{ ...cardStyle, animationDelay: `${idx * 0.05}s` }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={keyBadgeStyle}>
                    <span>{proj.key}</span>
                  </div>
                  <span style={ticketCountStyle}>
                    {(proj.nextTicketNumber || 1) - 1} tickets
                  </span>
                </div>

                <h3 style={cardTitleStyle}>{proj.name}</h3>

                <p style={cardDescriptionStyle}>
                  {proj.description || "No description provided."}
                </p>

                <div style={cardFooterStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <Terminal size={12} />
                    <span>Prefix: <strong>{proj.key}-#</strong></span>
                  </div>
                  <div style={cardLinkStyle}>
                    <span>Open Board</span>
                    <span className="card-arrow" style={{ display: "inline-flex" }}>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

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

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: 1140,
  width: "100%",
  margin: "0 auto",
  padding: "32px 24px",
};

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: 24,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 16,
};

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
