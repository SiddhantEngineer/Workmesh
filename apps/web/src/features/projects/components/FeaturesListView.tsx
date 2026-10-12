"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, ArrowUpRight } from "lucide-react";
import type { FeatureSummary, Priority, EpicSummary } from "@workmesh/shared";
import { FEATURE_STATUS_LABELS, PRIORITY_LABELS } from "@workmesh/shared";

interface FeaturesListViewProps {
  projectKey: string;
  features: FeatureSummary[];
  epics: EpicSummary[];
}

const PRIORITY_BADGE_STYLE: Record<Priority, { bg: string; text: string }> = {
  LOW: { bg: "rgba(102, 102, 96, 0.15)", text: "var(--text-muted)" },
  MEDIUM: { bg: "rgba(217, 119, 6, 0.15)", text: "var(--color-warning)" },
  HIGH: { bg: "rgba(124, 117, 242, 0.15)", text: "var(--accent-primary)" },
  CRITICAL: { bg: "rgba(220, 38, 38, 0.15)", text: "var(--color-danger)" },
};

export function FeaturesListView({ projectKey, features, epics }: FeaturesListViewProps) {
  const epicMap = React.useMemo(() => {
    const map = new Map<number, EpicSummary>();
    epics.forEach((e) => map.set(e.id, e));
    return map;
  }, [epics]);

  if (features.length === 0) {
    return (
      <div style={emptyContainerStyle}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          No features found for this selection.
        </p>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr style={tableHeaderRowStyle}>
            <th style={thStyle}>Key</th>
            <th style={{ ...thStyle, width: "40%" }}>Title</th>
            <th style={thStyle}>Epic</th>
            <th style={thStyle}>Priority</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Criteria</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => {
            const ticketKey = `${projectKey}-${feature.ticketNumber}`;
            const epic = epicMap.get(feature.epicId);
            const totalCriteria = feature.acceptanceCriteria?.length || 0;
            const completedCriteria =
              feature.acceptanceCriteria?.filter((c) => c.completed)?.length || 0;
            const priorityStyle = PRIORITY_BADGE_STYLE[feature.priority];

            return (
              <tr key={feature.id} className="list-table-row">
                <td style={tdStyle}>
                  <span style={keyBadgeStyle}>{ticketKey}</span>
                </td>
                <td style={tdStyle}>
                  <Link
                    href={`/projects/${projectKey}/features/${ticketKey}`}
                    className="breadcrumb-link"
                    style={{ fontWeight: 500 }}
                  >
                    {feature.title}
                  </Link>
                </td>
                <td style={tdStyle}>
                  <span style={epicBadgeStyle}>
                    {epic ? epic.title : "—"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      ...badgeStyle,
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.text,
                    }}
                  >
                    {PRIORITY_LABELS[feature.priority] || feature.priority}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle}>
                    {FEATURE_STATUS_LABELS[feature.status] || feature.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={criteriaStyle}>
                    <CheckSquare size={13} style={{ color: "var(--text-muted)" }} />
                    <span>
                      {completedCriteria}/{totalCriteria}
                    </span>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Link
                    href={`/projects/${projectKey}/features/${ticketKey}`}
                    className="action-link"
                  >
                    <span>View</span>
                    <ArrowUpRight size={14} className="action-arrow" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "0.85rem",
};

const tableHeaderRowStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  borderBottom: "1px solid var(--border-subtle)",
};

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "0.74rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--border-subtle)",
  transition: "background-color 0.15s ease",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle",
};

const keyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  fontWeight: 700,
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  padding: "2px 6px",
  borderRadius: 4,
};

const featureTitleLinkStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  textDecoration: "none",
  fontWeight: 500,
};

const epicBadgeStyle: React.CSSProperties = {
  fontSize: "0.76rem",
  color: "var(--text-secondary)",
};

const badgeStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  padding: "2px 8px",
  borderRadius: 12,
  display: "inline-block",
};

const statusBadgeStyle: React.CSSProperties = {
  fontSize: "0.74rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  padding: "2px 7px",
  borderRadius: 4,
};

const criteriaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.76rem",
  color: "var(--text-muted)",
};

const actionLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  color: "var(--accent-primary)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.78rem",
};

const emptyContainerStyle: React.CSSProperties = {
  padding: "36px 16px",
  textAlign: "center",
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
};
