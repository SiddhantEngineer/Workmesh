"use client";

import React from "react";
import type { EpicSummary } from "@workmesh/shared";

interface EpicsFilterBarProps {
  projectKey: string;
  epics: EpicSummary[];
  selectedEpicId: number | null;
  onSelectEpic: (epicId: number | null) => void;
  featuresCountByEpic?: Record<number, number>;
  totalFeaturesCount: number;
}

export function EpicsFilterBar({
  projectKey,
  epics,
  selectedEpicId,
  onSelectEpic,
  featuresCountByEpic = {},
  totalFeaturesCount,
}: EpicsFilterBarProps) {
  return (
    <div style={containerStyle}>
      <div style={labelStyle}>Epics:</div>
      <div style={listStyle}>
        <button
          onClick={() => onSelectEpic(null)}
          style={{
            ...pillStyle,
            backgroundColor:
              selectedEpicId === null ? "var(--accent-primary)" : "var(--surface-raised)",
            color: selectedEpicId === null ? "#FFFFFF" : "var(--text-secondary)",
            borderColor:
              selectedEpicId === null ? "var(--accent-primary)" : "var(--border-subtle)",
          }}
        >
          <span>All Epics</span>
          <span
            style={{
              ...countBadgeStyle,
              backgroundColor:
                selectedEpicId === null ? "rgba(255, 255, 255, 0.2)" : "var(--surface)",
              color: selectedEpicId === null ? "#FFFFFF" : "var(--text-muted)",
            }}
          >
            {totalFeaturesCount}
          </span>
        </button>

        {epics.map((epic) => {
          const isSelected = selectedEpicId === epic.id;
          const epicTicketKey = `${projectKey}-${epic.ticketNumber}`;
          const count = featuresCountByEpic[epic.id] || 0;

          return (
            <button
              key={epic.id}
              onClick={() => onSelectEpic(isSelected ? null : epic.id)}
              style={{
                ...pillStyle,
                backgroundColor: isSelected ? "var(--accent-primary)" : "var(--surface-raised)",
                color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                borderColor: isSelected ? "var(--accent-primary)" : "var(--border-subtle)",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.74rem" }}>
                {epicTicketKey}
              </span>
              <span style={{ fontWeight: 500 }}>{epic.title}</span>
              <span
                style={{
                  ...countBadgeStyle,
                  backgroundColor: isSelected ? "rgba(255, 255, 255, 0.2)" : "var(--surface)",
                  color: isSelected ? "#FFFFFF" : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
  overflowX: "auto",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  flexShrink: 0,
};

const listStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "nowrap",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  borderRadius: 16,
  border: "1px solid var(--border-subtle)",
  fontSize: "0.78rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.15s ease",
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  padding: "1px 5px",
  borderRadius: 10,
  fontWeight: 600,
};
