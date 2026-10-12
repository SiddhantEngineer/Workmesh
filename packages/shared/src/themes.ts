import { z } from "zod";

/**
 * Card color tokens for light and dark modes.
 */
export const cardThemeTokensSchema = z.object({
  bgLight: z.string(),
  textLight: z.string(),
  bgDark: z.string(),
  textDark: z.string(),
});

/**
 * Extensible design tokens container for a theme.
 * Scoped by UI element (e.g. card, future features/bugs).
 */
export const themeTokensSchema = z.object({
  card: cardThemeTokensSchema,
});

export type CardThemeTokens = z.infer<typeof cardThemeTokensSchema>;
export type ThemeTokens = z.infer<typeof themeTokensSchema>;

/**
 * Full Theme entity transferred from the backend API.
 */
export interface Theme {
  id: number;
  key: string;
  name: string;
  tokens: ThemeTokens;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
