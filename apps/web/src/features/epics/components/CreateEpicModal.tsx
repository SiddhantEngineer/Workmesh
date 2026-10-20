"use client";

import React, { useState } from "react";
import { Milestone, AlertCircle } from "lucide-react";
import {
  createEpicBodySchema,
  PRIORITY_LEVELS,
  type Priority,
  type Epic,
} from "@workmesh/shared";
import { useCreateEpicMutation } from "../queries";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";

interface CreateEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  onCreated?: (epic: Epic) => void;
}

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  LOW: { bg: "rgba(100, 116, 139, 0.12)", text: "var(--text-secondary)", border: "var(--border-subtle)" },
  MEDIUM: { bg: "rgba(59, 130, 246, 0.12)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" },
  HIGH: { bg: "rgba(249, 115, 22, 0.12)", text: "#F97316", border: "rgba(249, 115, 22, 0.3)" },
  CRITICAL: { bg: "rgba(239, 68, 68, 0.12)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
};

export function CreateEpicModal({
  isOpen,
  onClose,
  projectKey,
  onCreated,
}: CreateEpicModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEpicMutation(projectKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side Zod validation using @workmesh/shared
    const result = createEpicBodySchema.safeParse({
      title,
      description,
      priority,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const created = await createMutation.mutateAsync({
        title: result.data.title,
        description: result.data.description,
        priority: result.data.priority,
      });

      // Reset form fields
      setTitle("");
      setDescription("");
      setPriority("HIGH");
      onClose();
      onCreated?.(created);
    } catch (err: any) {
      setErrors({
        submit: err.message || "Failed to create epic. Please try again.",
      });
    }
  };

  const handleModalClose = () => {
    if (!createMutation.isPending) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      icon={<Milestone size={18} color="var(--accent-primary)" />}
      title="Create New Epic"
      subtitle={`Stage a major milestone under project ${projectKey}`}
      maxWidth={520}
    >
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Global Submit Error Banner */}
        {errors.submit && (
          <div style={errorBannerStyle}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Epic Title Field */}
        <div style={fieldGroupStyle}>
          <label htmlFor="epic-title" style={labelStyle}>
            Epic Title <span style={requiredStarStyle}>*</span>
          </label>
          <input
            id="epic-title"
            type="text"
            placeholder="e.g. Authentication & Authorization"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            disabled={createMutation.isPending}
            style={{
              ...inputStyle,
              borderColor: errors.title
                ? "var(--color-danger)"
                : "var(--border-subtle)",
            }}
            autoFocus
          />
          {errors.title && <p style={fieldErrorStyle}>{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div style={fieldGroupStyle}>
          <label htmlFor="epic-description" style={labelStyle}>
            Description <span style={optionalSpanStyle}>(optional)</span>
          </label>
          <textarea
            id="epic-description"
            rows={3}
            placeholder="High-level goals, milestones, or architecture notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 76,
            }}
          />
        </div>

        {/* Priority Selector */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Priority Level</label>
          <div style={priorityRowStyle}>
            {PRIORITY_LEVELS.map((level) => {
              const isSelected = priority === level;
              const colorInfo = PRIORITY_COLORS[level];
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  disabled={createMutation.isPending}
                  style={{
                    ...priorityButtonStyle,
                    backgroundColor: isSelected
                      ? colorInfo.bg
                      : "var(--surface)",
                    color: isSelected
                      ? colorInfo.text
                      : "var(--text-secondary)",
                    borderColor: isSelected
                      ? colorInfo.border
                      : "var(--border-subtle)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={actionsRowStyle}>
          <button
            type="button"
            onClick={handleModalClose}
            disabled={createMutation.isPending}
            className="btn-secondary"
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary"
            style={submitButtonStyle}
          >
            {createMutation.isPending ? (
              <>
                <Spinner size={14} color="#FFFFFF" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Epic</span>
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

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const requiredStarStyle: React.CSSProperties = {
  color: "var(--color-danger)",
};

const optionalSpanStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontWeight: 400,
  fontSize: "0.78rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  fontSize: "0.88rem",
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color var(--duration-fast) var(--ease-snappy)",
};

const priorityRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const priorityButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "7px 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-subtle)",
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "background-color var(--duration-fast) ease, border-color var(--duration-fast) ease, color var(--duration-fast) ease, transform var(--duration-instant) var(--ease-editorial)",
  textAlign: "center",
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: "0.76rem",
  color: "var(--color-danger)",
  margin: 0,
};

const errorBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 6,
  backgroundColor: "rgba(220, 38, 38, 0.1)",
  color: "var(--color-danger)",
  fontSize: "0.82rem",
};

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
  marginTop: 6,
  paddingTop: 16,
  borderTop: "1px solid var(--border-subtle)",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: "0.86rem",
  fontWeight: 500,
  cursor: "pointer",
  backgroundColor: "var(--surface)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-subtle)",
};

const submitButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 18px",
  borderRadius: 6,
  fontSize: "0.84rem",
  fontWeight: 600,
  cursor: "pointer",
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  border: "none",
};
