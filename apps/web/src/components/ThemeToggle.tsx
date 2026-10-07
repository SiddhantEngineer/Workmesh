"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Read existing setting or system preference
    const saved = localStorage.getItem("workmesh-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("workmesh-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
        }}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={buttonStyle}
    >
      {theme === "dark" ? (
        <Sun size={16} color="var(--text-primary)" style={iconStyle} />
      ) : (
        <Moon size={16} color="var(--text-primary)" style={iconStyle} />
      )}
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 6,
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const iconStyle: React.CSSProperties = {
  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
};
