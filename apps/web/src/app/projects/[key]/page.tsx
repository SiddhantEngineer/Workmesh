"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { TopNav } from "../../../components/layout/TopNav";
import { Breadcrumbs } from "../../../components/ui/Breadcrumbs";
import { Spinner } from "../../../components/ui/Spinner";
import { ProjectHeader } from "../../../features/projects/components/ProjectHeader";
import { EpicsFilterBar } from "../../../features/projects/components/EpicsFilterBar";
import { KanbanBoard } from "../../../features/projects/components/KanbanBoard";
import { FeaturesListView } from "../../../features/projects/components/FeaturesListView";
import { ProjectBoardSkeleton } from "../../../features/projects/components/ProjectBoardSkeleton";
import { useProjectByKeyQuery } from "../../../features/projects/queries";
import { CreateEpicModal } from "../../../features/epics/components/CreateEpicModal";
import { CreateFeatureModal } from "../../../features/features/components/CreateFeatureModal";

export default function ProjectHubPage() {
  const routeParams = useParams();
  const rawKey = (routeParams?.key as string) || "";
  const projectKey = rawKey.toUpperCase();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [isCreateFeatureOpen, setIsCreateFeatureOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useProjectByKeyQuery(projectKey);

  // Compute feature counts per epic
  const featuresCountByEpic = useMemo(() => {
    if (!project?.features) return {};
    const counts: Record<number, number> = {};
    project.features.forEach((f) => {
      counts[f.epicId] = (counts[f.epicId] || 0) + 1;
    });
    return counts;
  }, [project?.features]);

  // Filter features if an epic filter is active
  const filteredFeatures = useMemo(() => {
    if (!project?.features) return [];
    if (selectedEpicId === null) return project.features;
    return project.features.filter((f) => f.epicId === selectedEpicId);
  }, [project?.features, selectedEpicId]);

  // Loading Skeleton View (Unified with loading.tsx for seamless zero-flash loading)
  if (isLoading) {
    return <ProjectBoardSkeleton />;
  }

  // Not Found / Error View
  if (isError || !project) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/" },
            { label: projectKey || "Not Found" },
          ]}
        />
        <div className="error-card" style={errorCardStyle}>
          <div style={errorIconWrapperStyle}>
            <AlertCircle size={28} color="var(--color-danger)" />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Project Not Found
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            No active project with prefix key &ldquo;{projectKey}&rdquo; was found.
            {error ? ` (${error.message})` : ""}
          </p>
          <Link href="/" className="btn-primary" style={backButtonStyle}>
            <ArrowLeft size={15} />
            <span>Back to Projects Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dedicated Page Breadcrumbs */}
      <div style={{ marginBottom: "var(--space-2)" }}>
        <Breadcrumbs
            items={[
              { label: "Projects", href: "/" },
              { label: project.name },
            ]}
          />
        </div>

        {/* Project Header with Metadata & View Switcher */}
        <ProjectHeader
          project={project}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateEpic={() => setIsCreateEpicOpen(true)}
          onProposeFeature={() => setIsCreateFeatureOpen(true)}
        />

        {/* Roadmap / Epics Filter Bar (only rendered when epics exist) */}
        {project.epics && project.epics.length > 0 && (
          <div style={{ marginTop: "var(--space-3)", marginBottom: "var(--space-3)" }}>
            <EpicsFilterBar
              projectKey={project.key}
              epics={project.epics}
              selectedEpicId={selectedEpicId}
              onSelectEpic={setSelectedEpicId}
              onCreateEpic={() => setIsCreateEpicOpen(true)}
              featuresCountByEpic={featuresCountByEpic}
              totalFeaturesCount={project.features?.length || 0}
            />
          </div>
        )}

        {/* Board or List Content */}
        <div style={{ marginTop: "var(--space-3)" }}>
          {viewMode === "kanban" ? (
            <KanbanBoard
              projectKey={project.key}
              features={filteredFeatures}
              onProposeFeature={() => setIsCreateFeatureOpen(true)}
            />
          ) : (
            <FeaturesListView
              projectKey={project.key}
              features={filteredFeatures}
              epics={project.epics || []}
            />
          )}
        </div>

        {/* Create Epic Modal Dialog */}
        <CreateEpicModal
          isOpen={isCreateEpicOpen}
          onClose={() => setIsCreateEpicOpen(false)}
          projectKey={project.key}
        />

        {/* Create Feature Modal Dialog */}
        <CreateFeatureModal
          isOpen={isCreateFeatureOpen}
          onClose={() => setIsCreateFeatureOpen(false)}
          projectKey={project.key}
          epics={project.epics || []}
          defaultEpicId={selectedEpicId}
        />
    </div>
  );
}

const pageContainerStyle: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--surface)",
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: 1340,
  width: "100%",
  margin: "0 auto",
  padding: "16px 24px 48px 24px",
  display: "flex",
  flexDirection: "column",
};

const loadingContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  minHeight: 300,
};

const errorCardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "36px 32px",
  maxWidth: 480,
  margin: "48px auto",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--space-3)",
};

const errorIconWrapperStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  backgroundColor: "rgba(220, 38, 38, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const backButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
  textDecoration: "none",
  marginTop: 8,
};
