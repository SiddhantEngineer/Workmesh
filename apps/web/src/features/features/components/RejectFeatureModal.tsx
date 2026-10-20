"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { FeatureSummary } from "@workmesh/shared";
import { useRejectFeatureMutation } from "../queries";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";

interface RejectFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureSummary;
  projectKey: string;
}

export function RejectFeatureModal({
  isOpen,
  onClose,
  feature,
  projectKey,
}: RejectFeatureModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rejectMutation = useRejectFeatureMutation(projectKey);
  const ticketKey = feature.key || `${projectKey}-${feature.ticketNumber}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for rejecting this feature.");
      return;
    }

    setError(null);
    rejectMutation.mutate(
      { featureId: feature.id, reason: trimmed },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
        onError: (err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to reject feature");
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!rejectMutation.isPending) {
          setError(null);
          setReason("");
          onClose();
        }
      }}
      title={`Reject ${ticketKey}`}
      subtitle={`Feature: "${feature.title}"`}
      icon={<AlertTriangle size={18} color="var(--color-danger)" />}
      maxWidth={480}
    >
      <form onSubmit={handleSubmit} style={formStyle}>
        <p style={descriptionTextStyle}>
          Rejecting this feature will remove it from the proposed backlog and record an
          immutable audit log reason so autonomous agents and teammates understand why.
        </p>

        <div style={fieldGroupStyle}>
          <label htmlFor="rejection-reason-input" style={labelStyle}>
            Rejection Reason <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <textarea
            id="rejection-reason-input"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Duplicate of existing work, out of MVP scope, or requires further technical breakdown..."
            style={textareaStyle}
            disabled={rejectMutation.isPending}
            autoFocus
          />
          {error && <span style={errorTextStyle}>{error}</span>}
        </div>

        <div style={actionsRowStyle}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={rejectMutation.isPending}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-danger"
            disabled={rejectMutation.isPending}
            style={rejectButtonStyle}
          >
            {rejectMutation.isPending ? (
              <>
                <Spinner size="xs" color="#FFFFFF" />
                <span>Rejecting...</span>
              </>
            ) : (
              <span>Reject Feature</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: "20px 24px",
};

const descriptionTextStyle: React.CSSProperties = {
  fontSize: "0.86rem",
  color: "var(--text-secondary)",
  lineHeight: 1.55,
  margin: 0,
};

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.80rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--surface)",
  color: "var(--text-primary)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  lineHeight: 1.5,
  resize: "vertical",
  outline: "none",
  minHeight: 80,
};

const errorTextStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--color-danger)",
  fontWeight: 500,
};

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 6,
  paddingTop: 16,
  borderTop: "1px solid var(--border-subtle)",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--surface)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: "0.86rem",
  fontWeight: 500,
};

const rejectButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "0.86rem",
};
