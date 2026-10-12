"use client";

import React, { useState } from "react";
import { FolderPlus, Sparkles, AlertCircle, Check } from "lucide-react";
import { createProjectSchema, type Project } from "@workmesh/shared";
import { useCreateProjectMutation } from "../queries";
import { useThemesQuery, getThemeVariables } from "../../themes";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: themes } = useThemesQuery();
  const createMutation = useCreateProjectMutation();

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically sanitize and uppercase key as user types
    const raw = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setKey(raw);
    if (errors.key) {
      setErrors((prev) => ({ ...prev, key: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side Zod validation using @workmesh/shared
    const result = createProjectSchema.safeParse({
      name,
      key,
      description: description || undefined,
      themeId: selectedThemeId,
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

    // 2. Submit via TanStack Query mutation
    try {
      const newProject = await createMutation.mutateAsync(result.data);
      // Reset form and notify parent
      setName("");
      setKey("");
      setDescription("");
      setSelectedThemeId(1);
      setErrors({});
      onCreated?.(newProject);
      onClose();
    } catch {
      // Error is captured in createMutation.error
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<FolderPlus size={18} color="var(--accent-primary)" />}
      title="Create New Project"
      subtitle="Initialize a project workspace with a unique ticket prefix and theme"
    >
      {/* Server error banner */}
      {createMutation.isError && (
        <div style={errorBannerStyle}>
          <AlertCircle size={16} />
          <span>{createMutation.error?.message || "Failed to create project"}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Project Name */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Project Name *</label>
          <input
            type="text"
            placeholder="e.g. Workmesh Core Platform"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            style={inputStyle(!!errors.name)}
            autoFocus
          />
          {errors.name && <span style={fieldErrorStyle}>{errors.name}</span>}
        </div>

        {/* Project Key */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Project Key *
            <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
              (Ticket Prefix)
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. WM, CORE"
            maxLength={10}
            value={key}
            onChange={handleKeyChange}
            style={{ ...inputStyle(!!errors.key), letterSpacing: "1px", fontWeight: 600 }}
          />
          {errors.key && <span style={fieldErrorStyle}>{errors.key}</span>}
          {key.length >= 2 && (
            <div className="animate-badge-pop" style={previewBadgeStyle}>
              <Sparkles size={13} color="var(--color-success)" />
              <span>
                Tickets will look like: <strong>{key}-1</strong>, <strong>{key}-2</strong>
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Description (Optional)</label>
          <textarea
            placeholder="Brief summary of the project goals and architecture..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textareaStyle}
          />
        </div>

        {/* Theme Selection - Grid of Template Preview Cards */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Theme Color *
            <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
              (Workspace visual identity)
            </span>
          </label>

          <div style={themeGridStyle}>
            {themes?.map((t) => {
              const isSelected = selectedThemeId === t.id;
              const tVars = getThemeVariables(t);

              return (
                <button
                  key={t.id}
                  type="button"
                  className="themed-card theme-preview-card"
                  onClick={() => {
                    setSelectedThemeId(t.id);
                    if (errors.themeId) setErrors((prev) => ({ ...prev, themeId: "" }));
                  }}
                  style={{
                    ...themeCardButtonStyle,
                    ...tVars,
                    border: isSelected
                      ? "2px solid var(--accent-primary)"
                      : "1px solid var(--theme-card-border)",
                    boxShadow: isSelected
                      ? "0 0 0 2px rgba(49, 44, 133, 0.25)"
                      : "none",
                  }}
                >
                  <div style={themeCardHeaderStyle}>
                    <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{t.name}</span>
                    {isSelected && (
                      <Check size={14} style={{ color: "var(--theme-card-text)" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--theme-card-muted)" }}>
                    Card Header Preview
                  </span>
                </button>
              );
            })}
          </div>
          {errors.themeId && <span style={fieldErrorStyle}>{errors.themeId}</span>}
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          <button
            type="button"
            onClick={onClose}
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
            style={{
              ...submitButtonStyle,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {createMutation.isPending && (
              <Spinner size="sm" color="#FFFFFF" label="Creating project..." />
            )}
            <span>{createMutation.isPending ? "Creating..." : "Create Project"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

const errorBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "rgba(220, 38, 38, 0.08)",
  borderBottom: "1px solid rgba(220, 38, 38, 0.2)",
  padding: "10px 20px",
  color: "var(--color-danger)",
  fontSize: "0.85rem",
};

const formStyle: React.CSSProperties = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
};

const formGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  backgroundColor: "var(--surface)",
  border: `1px solid ${hasError ? "var(--color-danger)" : "var(--border-subtle)"}`,
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: "0.9rem",
  color: "var(--text-primary)",
  transition: "border-color 0.15s",
});

const textareaStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: "0.9rem",
  color: "var(--text-primary)",
  resize: "vertical",
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--color-danger)",
};

const previewBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.8rem",
  fontFamily: "var(--font-mono)",
  color: "var(--color-success)",
  backgroundColor: "rgba(22, 163, 74, 0.08)",
  padding: "4px 8px",
  borderRadius: 4,
  width: "fit-content",
  marginTop: 2,
};

const themeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
  gap: 8,
  marginTop: 4,
};

const themeCardButtonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  padding: "10px 12px",
  borderRadius: 6,
  cursor: "pointer",
  textAlign: "left",
};

const themeCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  marginTop: "var(--space-2)",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  fontSize: "0.88rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  backgroundColor: "transparent",
  border: "1px solid var(--border-subtle)",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: "0.88rem",
  fontWeight: 600,
  color: "#FFFFFF",
  backgroundColor: "var(--accent-primary)",
};
