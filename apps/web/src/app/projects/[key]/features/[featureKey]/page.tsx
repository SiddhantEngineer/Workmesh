"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  Clock,
  AlertCircle,
  Play,
  X,
  Bug,
  Layers,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import type { Priority, FeatureStatus } from "@workmesh/shared";
import { PRIORITY_LABELS } from "@workmesh/shared";
import { Breadcrumbs } from "../../../../../components/ui/Breadcrumbs";
import { Spinner } from "../../../../../components/ui/Spinner";
import {
  useFeatureDetailQuery,
  useUpdateFeatureCriteriaMutation,
  useApproveFeatureMutation,
} from "../../../../../features/features/queries";
import { useClaimTaskMutation } from "../../../../../features/tasks/queries";
import { RejectFeatureModal } from "../../../../../features/features/components/RejectFeatureModal";

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "var(--text-muted)",
  MEDIUM: "var(--color-warning)",
  HIGH: "#EA580C",
  CRITICAL: "var(--color-danger)",
};

const STATUS_BADGE_STYLES: Record<
  FeatureStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  PROPOSED: {
    bg: "rgba(100, 116, 139, 0.12)",
    color: "#64748B",
    border: "rgba(100, 116, 139, 0.25)",
    label: "Proposed",
  },
  APPROVED: {
    bg: "rgba(37, 99, 235, 0.12)",
    color: "#2563EB",
    border: "rgba(37, 99, 235, 0.3)",
    label: "Approved",
  },
  IN_PROGRESS: {
    bg: "rgba(234, 88, 12, 0.12)",
    color: "#EA580C",
    border: "rgba(234, 88, 12, 0.3)",
    label: "In Progress",
  },
  READY_FOR_TEST: {
    bg: "rgba(147, 51, 234, 0.12)",
    color: "#9333EA",
    border: "rgba(147, 51, 234, 0.3)",
    label: "Ready for Test",
  },
  CLOSED: {
    bg: "rgba(22, 163, 74, 0.12)",
    color: "#16A34A",
    border: "rgba(22, 163, 74, 0.3)",
    label: "Closed",
  },
  REJECTED: {
    bg: "rgba(220, 38, 38, 0.12)",
    color: "#DC2626",
    border: "rgba(220, 38, 38, 0.3)",
    label: "Rejected",
  },
};

export default function FeatureDetailPage() {
  const routeParams = useParams();
  const rawKey = (routeParams?.key as string) || "";
  const rawFeatureKey = (routeParams?.featureKey as string) || "";
  const projectKey = rawKey.toUpperCase();
  const featureKey = rawFeatureKey.toUpperCase();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);

  const {
    data: feature,
    isLoading,
    isError,
    error,
  } = useFeatureDetailQuery(projectKey, featureKey);

  const updateCriteriaMutation = useUpdateFeatureCriteriaMutation(
    projectKey,
    featureKey
  );
  const approveMutation = useApproveFeatureMutation(projectKey);
  const claimMutation = useClaimTaskMutation(projectKey);

  const handleToggleCriterion = (index: number, currentlyCompleted: boolean) => {
    if (!feature || updateCriteriaMutation.isPending) return;

    setTogglingIndex(index);
    updateCriteriaMutation.mutate(
      {
        featureId: feature.id,
        input: {
          criteriaIndex: index,
          completed: !currentlyCompleted,
        },
      },
      {
        onSettled: () => {
          setTogglingIndex(null);
        },
      }
    );
  };

  const handleApprove = () => {
    if (!feature) return;
    approveMutation.mutate({ featureId: feature.id });
  };

  const handleClaim = () => {
    if (!feature) return;
    claimMutation.mutate({
      taskId: feature.id,
      input: { ticketType: "FEATURE", agentId: "human-operator" },
    });
  };

  // Loading View
  if (isLoading) {
    return (
      <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <Spinner size="lg" color="var(--accent-primary)" />
        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Loading feature {featureKey}...
        </span>
      </div>
    );
  }

  // Error / Not Found View
  if (isError || !feature) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/" },
            { label: projectKey, href: `/projects/${projectKey}` },
            { label: featureKey },
          ]}
        />
        <div style={errorCardStyle}>
          <div style={errorIconWrapperStyle}>
            <AlertCircle size={28} color="var(--color-danger)" />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Feature Not Found</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            No feature matching &ldquo;{featureKey}&rdquo; was found under project &ldquo;{projectKey}&rdquo;.
            {error ? ` (${error.message})` : ""}
          </p>
          <Link
            href={`/projects/${projectKey}`}
            className="btn-primary"
            style={{ textDecoration: "none", marginTop: 8 }}
          >
            <ArrowLeft size={15} />
            <span>Back to Project Board</span>
          </Link>
        </div>
      </div>
    );
  }

  const criteria = feature.acceptanceCriteria || [];
  const totalCriteria = criteria.length;
  const completedCriteria = criteria.filter((c) => c.completed).length;
  const progressPercent =
    totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;

  const statusConfig = STATUS_BADGE_STYLES[feature.status] || STATUS_BADGE_STYLES.PROPOSED;

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/" },
            { label: feature.projectName || projectKey, href: `/projects/${projectKey}` },
            { label: "Features" },
            { label: feature.key || featureKey },
          ]}
        />
      </div>

      {/* Back Link */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href={`/projects/${projectKey}`}
          style={backLinkStyle}
        >
          <ArrowLeft size={14} />
          <span>Back to Project Board</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="feature-detail-grid" style={gridContainerStyle}>
        {/* Left Column: Core Work Surface */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          {/* Header Card */}
          <div style={cardStyle}>
            {/* Metadata Pills Header */}
            <div style={headerPillsRowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Formatted Ticket Key */}
                <span style={ticketKeyBadgeStyle}>
                  {feature.key}
                </span>

                {/* Priority Badge */}
                <span style={priorityBadgeStyle}>
                  <span
                    style={{
                      ...priorityPipStyle,
                      backgroundColor: PRIORITY_COLORS[feature.priority] || "var(--text-muted)",
                    }}
                  />
                  <span>{PRIORITY_LABELS[feature.priority] || feature.priority} Priority</span>
                </span>

                {/* Status Badge */}
                <span
                  style={{
                    ...statusBadgeBaseStyle,
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    borderColor: statusConfig.border,
                  }}
                >
                  {statusConfig.label}
                </span>

                {/* Parent Epic Reference */}
                {feature.epic && (
                  <span style={epicBadgeStyle} title={`Parent Epic: ${feature.epic.title}`}>
                    <Layers size={12} />
                    <span>{feature.epic.key}: {feature.epic.title}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Feature Title */}
            <h1 style={titleStyle}>{feature.title}</h1>

            {/* Description Block */}
            <div style={{ marginTop: 16 }}>
              <h3 style={sectionHeadingStyle}>Description</h3>
              {feature.description?.trim() ? (
                <div style={descriptionContentStyle}>
                  {feature.description}
                </div>
              ) : (
                <p style={emptyDescriptionStyle}>No description provided.</p>
              )}
            </div>
          </div>

          {/* Acceptance Criteria Section */}
          <div style={cardStyle}>
            <div style={criteriaHeaderStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquare size={18} color="var(--accent-primary)" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  Acceptance Criteria
                </h2>
              </div>
              <div style={criteriaCounterBadgeStyle}>
                <span className="tabular-nums font-mono" style={{ fontWeight: 600 }}>
                  {completedCriteria}/{totalCriteria} verified
                </span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Criteria Progress Bar */}
            <div style={progressBarTrackStyle}>
              <div
                style={{
                  ...progressBarFillStyle,
                  width: `${progressPercent}%`,
                  backgroundColor:
                    progressPercent === 100
                      ? "var(--color-success)"
                      : "var(--accent-primary)",
                }}
              />
            </div>

            {/* Interactive Criteria Checklist */}
            {totalCriteria > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {criteria.map((item, idx) => {
                  const isItemToggling =
                    updateCriteriaMutation.isPending && togglingIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleCriterion(idx, item.completed)}
                      disabled={updateCriteriaMutation.isPending}
                      style={{
                        ...criterionRowStyle,
                        backgroundColor: item.completed
                          ? "rgba(16, 185, 129, 0.04)"
                          : "var(--surface)",
                        borderColor: item.completed
                          ? "rgba(16, 185, 129, 0.25)"
                          : "var(--border-subtle)",
                      }}
                      className="criterion-item"
                    >
                      <div
                        style={{
                          ...checkboxStyle,
                          backgroundColor: item.completed
                            ? "var(--color-success)"
                            : "transparent",
                          borderColor: item.completed
                            ? "var(--color-success)"
                            : "var(--border-subtle)",
                        }}
                      >
                        {isItemToggling ? (
                          <Spinner size="xs" color={item.completed ? "#FFFFFF" : "var(--accent-primary)"} />
                        ) : item.completed ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </div>

                      <span
                        style={{
                          ...criterionTextStyle,
                          textDecoration: item.completed ? "line-through" : "none",
                          color: item.completed
                            ? "var(--text-muted)"
                            : "var(--text-primary)",
                        }}
                      >
                        {item.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", margin: "16px 0 0 0" }}>
                No acceptance criteria defined for this feature.
              </p>
            )}
          </div>

          {/* Linked Bugs Section */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Bug size={17} color="var(--text-secondary)" />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                Linked Bugs ({feature.linkedBugs?.length || 0})
              </h2>
            </div>

            {feature.linkedBugs && feature.linkedBugs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {feature.linkedBugs.map((bug) => (
                  <div key={bug.id} style={linkedBugRowStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={ticketKeyBadgeStyle}>{bug.key}</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>
                        {bug.title}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={priorityBadgeStyle}>
                        <span
                          style={{
                            ...priorityPipStyle,
                            backgroundColor: PRIORITY_COLORS[bug.priority] || "var(--text-muted)",
                          }}
                        />
                        <span>{bug.priority}</span>
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {bug.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", margin: 0 }}>
                No active bugs linked to this feature.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Actions, Metadata & Activity Audit Rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Contextual Actions Card */}
          <div style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Task Actions</h3>

            {feature.status === "PROPOSED" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={humanOnlyBannerStyle}>
                  <Shield size={14} color="#2563EB" />
                  <span>Human Operator Authorization Required</span>
                </div>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px 16px" }}
                >
                  {approveMutation.isPending ? (
                    <>
                      <Spinner size="xs" color="#FFFFFF" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Approve Feature</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={approveMutation.isPending}
                  className="btn-secondary"
                  style={{ width: "100%", padding: "8px 16px", color: "var(--color-danger)" }}
                >
                  <X size={14} />
                  <span>Reject Proposal</span>
                </button>
              </div>
            )}

            {feature.status === "APPROVED" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={readyBannerStyle}>
                  <span style={readyDotStyle} />
                  <span>Ready to Claim - Backlog Approved</span>
                </div>
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claimMutation.isPending}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    backgroundColor: "#2563EB",
                  }}
                >
                  {claimMutation.isPending ? (
                    <>
                      <Spinner size="xs" color="#FFFFFF" />
                      <span>Claiming Task...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      <span>Claim Task</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {feature.status === "IN_PROGRESS" && (
              <div style={inProgressBannerStyle}>
                <span style={pulseDotStyle} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600, color: "#EA580C", fontSize: "0.85rem" }}>
                    Active Development
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                    Claimed and currently being implemented.
                  </span>
                </div>
              </div>
            )}

            {feature.status === "READY_FOR_TEST" && (
              <div style={readyForTestBannerStyle}>
                <Clock size={16} color="#9333EA" />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600, color: "#9333EA", fontSize: "0.85rem" }}>
                    Ready for Verification
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                    Agent submitted deliverable. Awaiting human verification and closure.
                  </span>
                </div>
              </div>
            )}

            {feature.status === "CLOSED" && (
              <div style={closedBannerStyle}>
                <Check size={16} color="#16A34A" />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600, color: "#16A34A", fontSize: "0.85rem" }}>
                    Verified & Closed
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                    All acceptance criteria verified and signed off.
                  </span>
                </div>
              </div>
            )}

            {feature.status === "REJECTED" && (
              <div style={rejectedBannerStyle}>
                <X size={15} color="#DC2626" />
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#DC2626" }}>
                  Feature Proposal Rejected
                </span>
              </div>
            )}
          </div>

          {/* Metadata Card */}
          <div style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Properties</h3>
            <div style={metaGridStyle}>
              <div style={metaItemStyle}>
                <span style={metaLabelStyle}>
                  <Layers size={13} style={{ color: "var(--text-muted)" }} />
                  <span>Project</span>
                </span>
                <span style={metaValueStyle}>{feature.projectName} ({feature.projectKey})</span>
              </div>

              {feature.epic && (
                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>
                    <Layers size={13} style={{ color: "var(--text-muted)" }} />
                    <span>Parent Epic</span>
                  </span>
                  <span style={metaValueStyle}>{feature.epic.key}: {feature.epic.title}</span>
                </div>
              )}

              <div style={metaItemStyle}>
                <span style={metaLabelStyle}>
                  <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                  <span>Created</span>
                </span>
                <span style={metaValueStyle}>
                  {new Date(feature.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {feature.updatedAt && (
                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>
                    <Clock size={13} style={{ color: "var(--text-muted)" }} />
                    <span>Last Updated</span>
                  </span>
                  <span style={metaValueStyle}>
                    {new Date(feature.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chronological Activity Audit Timeline */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Clock size={16} color="var(--text-secondary)" />
              <h3 style={{ ...sectionHeadingStyle, margin: 0 }}>Activity & Audit Feed</h3>
            </div>

            {feature.activityLogs && feature.activityLogs.length > 0 ? (
              <div style={timelineContainerStyle}>
                {feature.activityLogs.map((log, idx) => {
                  const actorType = (log.details?.actor as { type?: string })?.type || "SYSTEM";
                  const notes = (log.details as { notes?: string })?.notes;

                  return (
                    <div key={log.id || idx} style={timelineItemStyle}>
                      <div style={timelineDotStyle} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={actionTagStyle}>{log.action}</span>
                          <span
                            style={{
                              ...actorBadgeStyle,
                              backgroundColor:
                                actorType === "AGENT"
                                  ? "rgba(147, 51, 234, 0.12)"
                                  : "rgba(37, 99, 235, 0.12)",
                              color: actorType === "AGENT" ? "#9333EA" : "#2563EB",
                            }}
                          >
                            <User size={10} />
                            <span>{actorType}</span>
                          </span>
                        </div>
                        {notes && <p style={timelineNotesStyle}>{notes}</p>}
                        <span style={timelineTimeStyle}>
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", margin: 0 }}>
                No recorded activity events yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reject Feature Modal */}
      {isRejectModalOpen && (
        <RejectFeatureModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          feature={feature}
          projectKey={projectKey}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Styles adhering strictly to Minimal Design System tokens
// ----------------------------------------------------------------------

const gridContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 340px",
  gap: 24,
  alignItems: "start",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.85rem",
  color: "var(--text-secondary)",
  textDecoration: "none",
  transition: "color var(--duration-fast) ease",
};

const headerPillsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const ticketKeyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  backgroundColor: "var(--surface-raised, rgba(0, 0, 0, 0.05))",
  border: "1px solid var(--border-subtle)",
  borderRadius: 4,
  padding: "2px 8px",
  letterSpacing: "0.02em",
};

const priorityBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  backgroundColor: "var(--surface-raised, rgba(0, 0, 0, 0.03))",
  border: "1px solid var(--border-subtle)",
  borderRadius: 4,
  padding: "2px 8px",
};

const priorityPipStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
};

const statusBadgeBaseStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 700,
  borderRadius: 4,
  padding: "2px 8px",
  border: "1px solid transparent",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const epicBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.78rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  backgroundColor: "var(--surface-raised, rgba(0, 0, 0, 0.03))",
  border: "1px solid var(--border-subtle)",
  borderRadius: 4,
  padding: "2px 8px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.45rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em",
  lineHeight: 1.3,
  margin: "0 0 4px 0",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 10,
};

const descriptionContentStyle: React.CSSProperties = {
  fontSize: "0.92rem",
  lineHeight: 1.65,
  color: "var(--text-primary)",
  whiteSpace: "pre-wrap",
};

const emptyDescriptionStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  color: "var(--text-muted)",
  fontStyle: "italic",
  margin: 0,
};

const criteriaHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const criteriaCounterBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.80rem",
  color: "var(--text-secondary)",
  backgroundColor: "var(--surface-raised, rgba(0, 0, 0, 0.04))",
  border: "1px solid var(--border-subtle)",
  borderRadius: 4,
  padding: "3px 8px",
};

const progressBarTrackStyle: React.CSSProperties = {
  width: "100%",
  height: 6,
  borderRadius: 3,
  backgroundColor: "var(--border-subtle)",
  overflow: "hidden",
};

const progressBarFillStyle: React.CSSProperties = {
  height: "100%",
  transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease",
};

const criterionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "10px 14px",
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  outline: "none",
  transition: "all var(--duration-fast) ease",
};

const checkboxStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 4,
  border: "1.5px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
  transition: "all var(--duration-fast) ease",
};

const criterionTextStyle: React.CSSProperties = {
  fontSize: "0.90rem",
  lineHeight: 1.5,
  flex: 1,
  transition: "color var(--duration-fast) ease",
};

const linkedBugRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--surface)",
};

const humanOnlyBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#2563EB",
  backgroundColor: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.2)",
  borderRadius: 6,
  padding: "8px 10px",
};

const readyBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "0.80rem",
  fontWeight: 600,
  color: "#2563EB",
  backgroundColor: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.2)",
  borderRadius: 6,
  padding: "8px 10px",
};

const readyDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#2563EB",
};

const inProgressBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "rgba(234, 88, 12, 0.08)",
  border: "1px solid rgba(234, 88, 12, 0.25)",
  borderRadius: 6,
  padding: "10px 12px",
};

const pulseDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#EA580C",
  boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.25)",
};

const rejectedBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "rgba(220, 38, 38, 0.08)",
  border: "1px solid rgba(220, 38, 38, 0.2)",
  borderRadius: 6,
  padding: "10px 12px",
};

const readyForTestBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "rgba(147, 51, 234, 0.08)",
  border: "1px solid rgba(147, 51, 234, 0.25)",
  borderRadius: 6,
  padding: "10px 12px",
};

const closedBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "rgba(22, 163, 74, 0.08)",
  border: "1px solid rgba(22, 163, 74, 0.25)",
  borderRadius: 6,
  padding: "10px 12px",
};

const metaGridStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const metaItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const metaLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const metaValueStyle: React.CSSProperties = {
  fontSize: "0.86rem",
  color: "var(--text-primary)",
  fontWeight: 500,
};

const timelineContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  borderLeft: "2px solid var(--border-subtle)",
  paddingLeft: 14,
  marginLeft: 4,
};

const timelineItemStyle: React.CSSProperties = {
  position: "relative",
};

const timelineDotStyle: React.CSSProperties = {
  position: "absolute",
  left: -20,
  top: 4,
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "var(--accent-primary)",
  border: "2px solid var(--surface)",
};

const actionTagStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.74rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  textTransform: "uppercase",
};

const actorBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.70rem",
  fontWeight: 700,
  borderRadius: 3,
  padding: "1px 5px",
};

const timelineNotesStyle: React.CSSProperties = {
  fontSize: "0.80rem",
  color: "var(--text-secondary)",
  lineHeight: 1.45,
  margin: "2px 0 0 0",
};

const timelineTimeStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "var(--text-muted)",
  marginTop: 2,
};

const errorCardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "48px 24px",
  textAlign: "center",
  maxWidth: 480,
  margin: "40px auto 0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const errorIconWrapperStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
