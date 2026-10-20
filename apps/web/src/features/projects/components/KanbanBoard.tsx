"use client";

import React from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { FEATURE_STATUS_LABELS, type FeatureSummary, type FeatureStatus } from "@workmesh/shared";
import { FeatureCard } from "./FeatureCard";

interface KanbanBoardProps {
  projectKey: string;
  features: FeatureSummary[];
  onProposeFeature?: () => void;
}

interface ColumnConfig {
  status: FeatureStatus;
  description: string;
  accent: string;
}

const COLUMNS: ColumnConfig[] = [
  { status: "PROPOSED", description: "Awaiting human review", accent: "var(--accent-primary)" },
  { status: "APPROVED", description: "Ready to claim", accent: "#2563EB" },
  { status: "IN_PROGRESS", description: "Active work", accent: "var(--color-warning)" },
  { status: "READY_FOR_TEST", description: "Awaiting human QA", accent: "#7C75F2" },
  { status: "CLOSED", description: "Verified deliverables", accent: "var(--color-success)" },
];

export function KanbanBoard({ projectKey, features, onProposeFeature }: KanbanBoardProps) {
  // Check if entire board is empty
  const isEmpty = features.length === 0;

  if (isEmpty) {
    return (
      <div style={emptyBoardContainerStyle}>
        <div style={emptyCardStyle}>
          <div style={emptyIconWrapperStyle}>
            <Sparkles size={24} color="var(--accent-primary)" />
          </div>
          <h3 style={emptyTitleStyle}>No features proposed yet</h3>
          <p style={emptyDescStyle}>
            This project does not have any active features. Human users or connected AI agents
            can propose features with acceptance criteria to get started.
          </p>
          {onProposeFeature && (
            <button onClick={onProposeFeature} className="btn-primary" style={proposeButtonStyle}>
              <PlusCircle size={16} />
              <span>+ Propose Feature</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-board-scroll" style={kanbanGridStyle}>
      {COLUMNS.map((col) => {
        const columnFeatures = features.filter((f) => f.status === col.status);

        return (
          <div key={col.status} style={columnContainerStyle}>
            <div style={columnHeaderStyle}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: col.accent,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <h4 style={columnTitleStyle}>{FEATURE_STATUS_LABELS[col.status]}</h4>
                  <span className="tabular-nums" style={columnCountBadgeStyle}>{columnFeatures.length}</span>
                </div>
                <p style={columnSubtitleStyle}>{col.description}</p>
              </div>
            </div>

            <div style={cardsContainerStyle}>
              {columnFeatures.length === 0 ? (
                <div style={emptyColumnStyle}>
                  <span>No tickets in this column</span>
                </div>
              ) : (
                columnFeatures.map((feature, idx) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    projectKey={projectKey}
                    index={idx}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const kanbanGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(260px, 1fr))",
  gap: "var(--space-3)",
  alignItems: "flex-start",
  overflowX: "auto",
  paddingBottom: "var(--space-4)",
};

const columnContainerStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "12px 10px",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  minHeight: 400,
};

const columnHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  paddingBottom: 8,
  borderBottom: "1px solid var(--border-subtle)",
};

const columnTitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const columnCountBadgeStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)",
  fontSize: "0.72rem",
  fontWeight: 600,
  padding: "1px 6px",
  borderRadius: 10,
};

const columnSubtitleStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "var(--text-muted)",
  marginTop: 2,
};

const cardsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  flex: 1,
};

const emptyColumnStyle: React.CSSProperties = {
  border: "1px dashed var(--border-subtle)",
  borderRadius: 6,
  padding: "24px 12px",
  textAlign: "center",
  color: "var(--text-muted)",
  fontSize: "0.78rem",
};

const emptyBoardContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "48px 16px",
};

const emptyCardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "36px 32px",
  maxWidth: 520,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--space-3)",
};

const emptyIconWrapperStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: "var(--surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const emptyDescStyle: React.CSSProperties = {
  fontSize: "0.86rem",
  color: "var(--text-secondary)",
  lineHeight: 1.5,
};

const proposeButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "9px 16px",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  marginTop: 6,
};
