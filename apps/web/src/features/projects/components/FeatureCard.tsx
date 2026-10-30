"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckSquare, Check, X, Play, Clock } from "lucide-react";
import type { FeatureSummary, Priority } from "@workmesh/shared";
import { PRIORITY_LABELS } from "@workmesh/shared";
import { Spinner } from "../../../components/ui/Spinner";
import { useApproveFeatureMutation } from "../../features/queries";
import { useClaimTaskMutation } from "../../tasks/queries";
import { RejectFeatureModal } from "../../features/components/RejectFeatureModal";

interface FeatureCardProps {
  feature: FeatureSummary;
  projectKey: string;
  index?: number;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "var(--text-muted)",
  MEDIUM: "var(--color-warning)",
  HIGH: "#EA580C",
  CRITICAL: "var(--color-danger)",
};

export function FeatureCard({ feature, projectKey, index = 0 }: FeatureCardProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const approveMutation = useApproveFeatureMutation(projectKey);
  const claimMutation = useClaimTaskMutation(projectKey);

  const ticketKey = feature.key || `${projectKey}-${feature.ticketNumber}`;
  const totalCriteria = feature.acceptanceCriteria?.length || 0;
  const completedCriteria =
    feature.acceptanceCriteria?.filter((c) => c.completed)?.length || 0;
  const progressPercent = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    approveMutation.mutate({ featureId: feature.id });
  };

  const handleOpenReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRejectModalOpen(true);
  };

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    claimMutation.mutate({
      taskId: feature.id,
      input: { ticketType: "FEATURE", agentId: "human-operator" },
    });
  };

  return (
    <>
      <Link
        href={`/projects/${projectKey}/features/${ticketKey}`}
        className="feature-card"
        style={{
          animation: "cardEntrance 0.22s var(--ease-editorial) both",
          animationDelay: `${Math.min(index * 0.03, 0.3)}s`,
        }}
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
          {feature.status === "APPROVED" && (
            <span style={readyBadgeStyle} title="Approved for autonomous agent development">
              Ready to Claim
            </span>
          )}
          {feature.status === "READY_FOR_TEST" && (
            <span style={readyForTestBadgeStyle} title="Implementation complete. Awaiting human QA verification.">
              Ready for Review
            </span>
          )}
        </div>

        <h4 style={titleStyle}>{feature.title}</h4>

        <div style={footerStyle}>
          <div style={{ width: "100%" }}>
            <div style={criteriaCounterStyle}>
              <CheckSquare size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span className="tabular-nums">
                {completedCriteria}/{totalCriteria} criteria
              </span>
            </div>
            {totalCriteria > 0 && (
              <div
                className="criteria-progress-bar"
                title={`${progressPercent}% criteria verified`}
              >
                <div
                  className="criteria-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {feature.status === "READY_FOR_TEST" && (
          <div style={reviewCalloutStyle}>
            <Clock size={11} style={{ flexShrink: 0 }} />
            <span>Awaiting Human Sign-Off</span>
          </div>
        )}

        {feature.status === "PROPOSED" && (
          <div
            style={cardActionsRowStyle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="feature-action-btn-approve"
              title="Approve feature into backlog"
              style={{ flex: 1, padding: "5px 10px" }}
            >
              {approveMutation.isPending ? (
                <Spinner size="xs" color="#15803D" />
              ) : (
                <Check size={12} />
              )}
              <span>Approve</span>
            </button>
            <button
              type="button"
              onClick={handleOpenReject}
              disabled={approveMutation.isPending}
              className="feature-action-btn-reject"
              title="Reject feature proposal"
              style={{ flex: 1, padding: "5px 10px" }}
            >
              <X size={12} />
              <span>Reject</span>
            </button>
          </div>
        )}

        {feature.status === "APPROVED" && (
          <div
            style={cardActionsRowStyle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={handleClaim}
              disabled={claimMutation.isPending}
              className="feature-action-btn-approve"
              title="Claim this task for active development"
              style={claimButtonStyle}
            >
              {claimMutation.isPending ? (
                <Spinner size="xs" color="#2563EB" />
              ) : (
                <Play size={11} fill="currentColor" />
              )}
              <span>Claim Task</span>
            </button>
          </div>
        )}
      </Link>

      {isRejectModalOpen && (
        <RejectFeatureModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          feature={feature}
          projectKey={projectKey}
        />
      )}
    </>
  );
}

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
  fontFamily: "var(--font-primary)",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  letterSpacing: "-0.01em",
};

const readyBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-primary)",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: "#2563EB",
  backgroundColor: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.22)",
  borderRadius: 4,
  padding: "1px 6px",
  letterSpacing: "0.01em",
  lineHeight: "1.4",
};

const readyForTestBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-primary)",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: "#9333EA",
  backgroundColor: "rgba(147, 51, 234, 0.08)",
  border: "1px solid rgba(147, 51, 234, 0.22)",
  borderRadius: 4,
  padding: "1px 6px",
  letterSpacing: "0.01em",
  lineHeight: "1.4",
};

const reviewCalloutStyle: React.CSSProperties = {
  marginTop: 10,
  padding: "4px 8px",
  borderRadius: 4,
  backgroundColor: "rgba(147, 51, 234, 0.06)",
  border: "1px solid rgba(147, 51, 234, 0.18)",
  color: "#9333EA",
  fontSize: "0.6875rem",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
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

const cardActionsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  paddingTop: 8,
  borderTop: "1px dashed var(--border-subtle)",
  marginTop: 2,
};

const claimButtonStyle: React.CSSProperties = {
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "5px 12px",
  fontSize: "0.75rem",
  fontWeight: 600,
  borderRadius: 4,
  border: "1px solid rgba(37, 99, 235, 0.35)",
  backgroundColor: "rgba(37, 99, 235, 0.08)",
  color: "#2563EB",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
