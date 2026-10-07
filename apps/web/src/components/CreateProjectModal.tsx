"use client";

import React, { useState } from "react";
import { X, FolderPlus, Sparkles, AlertCircle } from "lucide-react";
import { createProjectSchema, type CreateProjectInput } from "@workmesh/shared";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: any) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
    setServerError(null);

    // 1. Client-side Zod validation using @workmesh/shared
    const result = createProjectSchema.safeParse({
      name,
      key,
      description: description || undefined,
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

    // 2. Submit to Hono API
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Failed to create project");
        setIsSubmitting(false);
        return;
      }

      // Reset and notify parent
      setName("");
      setKey("");
      setDescription("");
      setErrors({});
      onCreated(json.data);
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Network error contacting API server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-backdrop" style={overlayStyle}>
      <div className="animate-modal" style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={iconBadgeStyle}>
              <FolderPlus size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Create New Project</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Initialize a project workspace with a unique ticket prefix
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={closeButtonStyle}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div style={errorBannerStyle}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
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
                <span>Tickets will look like: <strong>{key}-1</strong>, <strong>{key}-2</strong></span>
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

          {/* Actions */}
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={submitButtonStyle}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline component styles using design tokens
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  width: "100%",
  maxWidth: 480,
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid var(--border-subtle)",
};

const iconBadgeStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const closeButtonStyle: React.CSSProperties = {
  padding: 6,
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

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
