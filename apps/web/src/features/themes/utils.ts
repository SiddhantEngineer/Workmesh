import React from "react";
import type { Theme } from "@workmesh/shared";

/**
 * Returns CSS custom property definitions for a given theme.
 * When applied to a container element (card or header), globals.css
 * binds these to `--theme-card-bg` and `--theme-card-text` based on
 * the active light or dark mode.
 */
export function getThemeVariables(theme?: Theme): React.CSSProperties {
  if (!theme?.tokens?.card) {
    return {};
  }

  const { card } = theme.tokens;

  return {
    ["--project-card-bg-light" as string]: card.bgLight,
    ["--project-card-text-light" as string]: card.textLight,
    ["--project-card-bg-dark" as string]: card.bgDark,
    ["--project-card-text-dark" as string]: card.textDark,
  } as React.CSSProperties;
}
