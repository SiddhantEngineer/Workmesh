"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import type { FeatureSummary, Priority } from "@workmesh/shared";
import { PRIORITY_LABELS } from "@workmesh/shared";

interface FeatureCardProps {
  feature: FeatureSummary;
  projectKey: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "var(--text-muted)",
  MEDIUM: "var(--color-warning)",
  HIGH: "#E056FD",
  CRITICAL: "var(--color-danger)",
};

export function FeatureCard({ feature, projectKey }: FeatureCardProps) {
  const ticketKey = `${projectKey}-${feature.ticketNumber}`;
  const totalCriteria = feature.acceptanceCriteria?.length || 0;
  const completedCriteria =
    feature.acceptanceCriteria?.filter((c) => c.completed)?.length || 0;

  return (
    <Link
      href={`/projects/${projectKey}/features/${ticketKey}`}
      className="feature-card"
      style={cardStyle}
    >
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              ...priorityPipStyle,
              backgroundColor: PRIORITY_COLORS[feature.priority] || "var(--text-muted)",
            }}
            title={`Priority: ${PRIORITY_LABELS[feature.priority] || feature.priority}`}
          />
          <span style={keyBadgeStyle}>{ticketKey}</span>
        </div>
      </div>

      <h4 style={titleStyle}>{feature.title}</h4>

      <div style={footerStyle}>
        <div style={criteriaCounterStyle}>
          <CheckSquare size={13} style={{ color: "var(--text-muted)" }} />
          <span>
            {completedCriteria}/{totalCriteria} criteria
          </span>
        </div>
      </div>
    </Link>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  textDecoration: "none",
  color: "inherit",
  transition: "border-color 0.15s ease, transform 0.1s ease",
  cursor: "pointer",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const priorityPipStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  display: "inline-block",
  flexShrink: 0,
};

const keyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.74rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  letterSpacing: "0.02em",
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  fontWeight: 500,
  lineHeight: 1.4,
  color: "var(--text-primary)",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "2.4em",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: 8,
  borderTop: "1px solid var(--border-subtle)",
  marginTop: 4,
};

const criteriaCounterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.72rem",
  color: "var(--text-muted)",
};
