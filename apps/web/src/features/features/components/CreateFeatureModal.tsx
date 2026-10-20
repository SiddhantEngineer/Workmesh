"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Plus, Trash2, AlertCircle, CheckSquare } from "lucide-react";
import {
  createFeatureBodySchema,
  PRIORITY_LEVELS,
  type Priority,
  type EpicSummary,
  type Feature,
} from "@workmesh/shared";
import { useCreateFeatureMutation } from "../queries";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";

interface CreateFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  epics: EpicSummary[];
  defaultEpicId?: number | null;
  onCreated?: (feature: Feature) => void;
}

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  LOW: { bg: "rgba(100, 116, 139, 0.12)", text: "var(--text-secondary)", border: "var(--border-subtle)" },
  MEDIUM: { bg: "rgba(59, 130, 246, 0.12)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" },
  HIGH: { bg: "rgba(249, 115, 22, 0.12)", text: "#F97316", border: "rgba(249, 115, 22, 0.3)" },
  CRITICAL: { bg: "rgba(239, 68, 68, 0.12)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
};

export function CreateFeatureModal({
  isOpen,
  onClose,
  projectKey,
  epics,
  defaultEpicId,
  onCreated,
}: CreateFeatureModalProps) {
  const [selectedEpicId, setSelectedEpicId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateFeatureMutation(projectKey);

  // Sync initial epic selection when opening
  useEffect(() => {
    if (isOpen) {
      if (defaultEpicId && epics.some((e) => e.id === defaultEpicId)) {
        setSelectedEpicId(defaultEpicId);
      } else if (epics.length > 0) {
        setSelectedEpicId(epics[0].id);
      } else {
        setSelectedEpicId("");
      }
    }
  }, [isOpen, defaultEpicId, epics]);

  const handleAddCriterion = () => {
    setCriteria((prev) => [...prev, ""]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCriterionChange = (index: number, val: string) => {
    setCriteria((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (errors.acceptanceCriteria) {
      setErrors((prev) => ({ ...prev, acceptanceCriteria: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out blank criteria lines
    const cleanedCriteria = criteria
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    // Client-side Zod validation
    const result = createFeatureBodySchema.safeParse({
      epicId: typeof selectedEpicId === "number" ? selectedEpicId : 0,
      title,
      description,
      priority,
      acceptanceCriteria: cleanedCriteria,
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
        epicId: result.data.epicId,
        title: result.data.title,
        description: result.data.description,
        priority: result.data.priority,
        acceptanceCriteria: result.data.acceptanceCriteria,
      });

      // Reset form fields
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCriteria([""]);
      onClose();
      onCreated?.(created);
    } catch (err: any) {
      setErrors({
        submit: err.message || "Failed to create feature. Please try again.",
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
      icon={<PlusCircle size={18} color="var(--accent-primary)" />}
      title="Propose New Feature"
      subtitle={`Stage an actionable ticket under project ${projectKey}`}
      maxWidth={560}
    >
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Global Submit Error Banner */}
        {errors.submit && (
          <div style={errorBannerStyle}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Parent Epic Selector */}
        <div style={fieldGroupStyle}>
          <label htmlFor="feature-epic-select" style={labelStyle}>
            Parent Epic <span style={requiredStarStyle}>*</span>
          </label>
          {epics.length === 0 ? (
            <div style={emptyEpicsWarningStyle}>
              <AlertCircle size={14} color="var(--color-danger)" />
              <span>No epics found. Please create an Epic first before proposing features.</span>
            </div>
          ) : (
            <select
              id="feature-epic-select"
              value={selectedEpicId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setSelectedEpicId(val);
                if (errors.epicId) setErrors((prev) => ({ ...prev, epicId: "" }));
              }}
              disabled={createMutation.isPending}
              style={{
                ...selectStyle,
                borderColor: errors.epicId ? "var(--color-danger)" : "var(--border-subtle)",
              }}
            >
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {projectKey}-{epic.ticketNumber}: {epic.title}
                </option>
              ))}
            </select>
          )}
          {errors.epicId && <p style={fieldErrorStyle}>{errors.epicId}</p>}
        </div>

        {/* Feature Title Field */}
        <div style={fieldGroupStyle}>
          <label htmlFor="feature-title" style={labelStyle}>
            Feature Title <span style={requiredStarStyle}>*</span>
          </label>
          <input
            id="feature-title"
            type="text"
            placeholder="e.g. Implement Session Cookie"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            disabled={createMutation.isPending}
            style={{
              ...inputStyle,
              borderColor: errors.title ? "var(--color-danger)" : "var(--border-subtle)",
            }}
            autoFocus
          />
          {errors.title && <p style={fieldErrorStyle}>{errors.title}</p>}
        </div>

        {/* Description Field */}
        <div style={fieldGroupStyle}>
          <label htmlFor="feature-description" style={labelStyle}>
            Description <span style={optionalSpanStyle}>(optional)</span>
          </label>
          <textarea
            id="feature-description"
            rows={2}
            placeholder="Technical implementation scope, requirements, or design notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 64,
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
                    backgroundColor: isSelected ? colorInfo.bg : "var(--surface)",
                    color: isSelected ? colorInfo.text : "var(--text-secondary)",
                    borderColor: isSelected ? colorInfo.border : "var(--border-subtle)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Acceptance Criteria Checklist Builder */}
        <div style={fieldGroupStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={labelStyle}>
              Acceptance Criteria <span style={requiredStarStyle}>*</span>
            </label>
            <span style={checklistHintStyle}>Verifiable checklist items</span>
          </div>

          <div style={criteriaListStyle}>
            {criteria.map((item, index) => (
              <div key={index} style={criteriaRowStyle}>
                <div style={criteriaCheckIconStyle}>
                  <CheckSquare size={14} color="var(--text-muted)" />
                </div>
                <input
                  type="text"
                  placeholder={`Criterion ${index + 1} (e.g. Cookie has HttpOnly and Secure flags)`}
                  value={item}
                  onChange={(e) => handleCriterionChange(index, e.target.value)}
                  disabled={createMutation.isPending}
                  style={criteriaInputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(index)}
                  disabled={criteria.length <= 1 || createMutation.isPending}
                  aria-label="Remove criterion"
                  className="btn-secondary"
                  style={{
                    ...criteriaRemoveBtnStyle,
                    opacity: criteria.length <= 1 ? 0.35 : 1,
                    cursor: criteria.length <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <Trash2 size={13} color="var(--text-secondary)" />
                </button>
              </div>
            ))}
          </div>

          {errors.acceptanceCriteria && (
            <p style={fieldErrorStyle}>{errors.acceptanceCriteria}</p>
          )}

          <button
            type="button"
            onClick={handleAddCriterion}
            disabled={createMutation.isPending}
            className="btn-secondary"
            style={addCriterionBtnStyle}
          >
            <Plus size={13} />
            <span>+ Add Criterion</span>
          </button>
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
            disabled={createMutation.isPending || epics.length === 0}
            className="btn-primary"
            style={{
              ...submitButtonStyle,
              opacity: epics.length === 0 ? 0.5 : 1,
              cursor: epics.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {createMutation.isPending ? (
              <>
                <Spinner size={14} color="#FFFFFF" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Propose Feature</span>
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

const checklistHintStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  fontSize: "0.88rem",
  color: "var(--text-primary)",
  outline: "none",
  cursor: "pointer",
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
  borderRadius: 6,
  border: "1px solid var(--border-subtle)",
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "all var(--duration-fast) var(--ease-snappy)",
  textAlign: "center",
};

const criteriaListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const criteriaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const criteriaCheckIconStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const criteriaInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "7px 10px",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  fontSize: "0.84rem",
  color: "var(--text-primary)",
  outline: "none",
};

const criteriaRemoveBtnStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const addCriterionBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: "0.78rem",
  fontWeight: 500,
  marginTop: 4,
  cursor: "pointer",
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

const emptyEpicsWarningStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 6,
  backgroundColor: "rgba(220, 38, 38, 0.08)",
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
  backgroundColor: "var(--accent-primary)",
  color: "#FFFFFF",
  border: "none",
};
