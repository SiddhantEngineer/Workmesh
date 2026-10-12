import { useQuery } from "@tanstack/react-query";
import { themesApi } from "./api";
import type { Theme } from "@workmesh/shared";

export const themeKeys = {
  all: ["themes"] as const,
};

/**
 * Hook to retrieve and cache all preset themes.
 * Themes are cached indefinitely (staleTime: Infinity) since they are system tokens.
 */
export function useThemesQuery() {
  return useQuery({
    queryKey: themeKeys.all,
    queryFn: () => themesApi.list(),
    staleTime: Infinity,
  });
}

/**
 * Hook to resolve a theme by its ID from the cached themes list.
 */
export function useProjectTheme(themeId?: number): { theme?: Theme; isLoading: boolean } {
  const { data: themes, isLoading } = useThemesQuery();
  const theme = themes?.find((t) => t.id === themeId);
  return { theme, isLoading };
}
