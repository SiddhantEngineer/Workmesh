import React from "react";

export function ProjectBoardSkeleton() {
  return (
    <div style={containerStyle}>
      {/* Breadcrumb Skeleton */}
      <div style={breadcrumbRowStyle}>
        <div className="skeleton-shimmer" style={{ width: 60, height: 14 }} />
        <span style={{ color: "var(--border-subtle)", fontSize: "0.85rem" }}>/</span>
        <div className="skeleton-shimmer" style={{ width: 110, height: 14 }} />
      </div>

      {/* Split Hero Card Skeleton */}
      <div style={heroCardStyle}>
        {/* Left Hero Panel */}
        <div style={heroLeftPanelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="skeleton-shimmer" style={{ width: 130, height: 12 }} />
            <div className="skeleton-shimmer" style={{ width: 85, height: 12 }} />
          </div>

          <div className="skeleton-shimmer" style={{ width: 280, height: 32, marginTop: 4 }} />

          <div className="skeleton-shimmer" style={{ width: "80%", maxWidth: 520, height: 16 }} />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <div className="skeleton-shimmer" style={{ width: 90, height: 26, borderRadius: 5 }} />
            <div className="skeleton-shimmer" style={{ width: 80, height: 26, borderRadius: 5 }} />
            <div className="skeleton-shimmer" style={{ width: 95, height: 26, borderRadius: 5 }} />
          </div>
        </div>

        {/* Right Telemetry Panel */}
        <div style={heroRightPanelStyle}>
          <div>
            <div className="skeleton-shimmer" style={{ width: 110, height: 12, backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
            <div className="skeleton-shimmer" style={{ width: 55, height: 36, marginTop: 10, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
          </div>

          <div className="skeleton-shimmer" style={{ width: "100%", height: 36, borderRadius: 6, backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
        </div>
      </div>

      {/* Sub-bar / Tabs Skeleton */}
      <div style={subBarStyle}>
        <div style={switcherSkeletonStyle}>
          <div className="skeleton-shimmer" style={{ width: 75, height: 26, borderRadius: 4 }} />
          <div className="skeleton-shimmer" style={{ width: 60, height: 26, borderRadius: 4 }} />
        </div>
      </div>

      {/* 5 Column Kanban Skeleton */}
      <div style={kanbanGridStyle}>
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} style={columnSkeletonStyle}>
            <div style={columnHeaderSkeletonStyle}>
              <div className="skeleton-shimmer" style={{ width: 80, height: 14 }} />
              <div className="skeleton-shimmer" style={{ width: 22, height: 18, borderRadius: 10 }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: "100%", height: 88, borderRadius: 6 }} />
            <div className="skeleton-shimmer" style={{ width: "100%", height: 72, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
};

const breadcrumbRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingBottom: 2,
};

const heroCardStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--surface-raised)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
};

const heroLeftPanelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 320,
  padding: "24px 28px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  backgroundColor: "var(--surface-raised)",
};

const heroRightPanelStyle: React.CSSProperties = {
  width: 260,
  minWidth: 220,
  backgroundColor: "#0D1722",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 18,
};

const subBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  paddingTop: 4,
};

const switcherSkeletonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: 3,
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  backgroundColor: "var(--surface)",
};

const kanbanGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
  marginTop: 8,
};

const columnSkeletonStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minHeight: 280,
};

const columnHeaderSkeletonStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 8,
  borderBottom: "1px solid var(--border-subtle)",
};
