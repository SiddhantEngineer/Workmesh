"use client";

import React from "react";
import { Plus } from "lucide-react";
import type { EpicSummary } from "@workmesh/shared";

interface EpicsFilterBarProps {
  projectKey: string;
  epics: EpicSummary[];
  selectedEpicId: number | null;
  onSelectEpic: (epicId: number | null) => void;
  onCreateEpic?: () => void;
  featuresCountByEpic?: Record<number, number>;
  totalFeaturesCount: number;
}

export function EpicsFilterBar({
  projectKey,
  epics,
  selectedEpicId,
  onSelectEpic,
  onCreateEpic,
  featuresCountByEpic = {},
  totalFeaturesCount,
}: EpicsFilterBarProps) {
  return (
    <div style={containerStyle}>
      <div style={labelStyle}>Epics:</div>
      <div style={listStyle}>
        <button
          onClick={() => onSelectEpic(null)}
          className="filter-pill"
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
              className="filter-pill"
              style={{
                ...pillStyle,
                backgroundColor: isSelected ? "var(--accent-primary)" : "var(--surface-raised)",
                color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                borderColor: isSelected ? "var(--accent-primary)" : "var(--border-subtle)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.76rem" }}>
                {epicTicketKey}
              </span>
              <span style={{ fontWeight: 500 }}>{epic.title}</span>
              {epic.status === "PROPOSED" && (
                <span
                  style={{
                    fontSize: "0.70rem",
                    padding: "1px 6px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSelected
                      ? "rgba(255, 255, 255, 0.25)"
                      : "rgba(249, 115, 22, 0.12)",
                    color: isSelected ? "#FFFFFF" : "#F97316",
                    fontWeight: 600,
                  }}
                >
                  Proposed
                </span>
              )}
              <span
                className="tabular-nums"
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

        {onCreateEpic && (
          <button
            onClick={onCreateEpic}
            className="filter-pill"
            style={{
              ...pillStyle,
              backgroundColor: "transparent",
              borderStyle: "dashed",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
              gap: 4,
            }}
            title="Create a new epic under this project"
          >
            <Plus size={12} />
            <span>Epic</span>
          </button>
        )}
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
  fontSize: "0.80rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  letterSpacing: "-0.01em",
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
  borderRadius: "var(--radius-full)",
  border: "1px solid var(--border-subtle)",
  fontSize: "0.78rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background-color var(--duration-fast) ease, color var(--duration-fast) ease, border-color var(--duration-fast) ease, transform var(--duration-instant) var(--ease-editorial)",
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  padding: "1px 5px",
  borderRadius: "var(--radius-full)",
  fontWeight: 600,
};
