import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { epicsApi } from "./api";
import { projectKeys } from "../projects/queries";
import type { CreateEpicBodyInput } from "@workmesh/shared";

export const epicKeys = {
  all: ["epics"] as const,
  byProject: (projectKey: string) =>
    [...epicKeys.all, "byProject", projectKey ? projectKey.toUpperCase() : ""] as const,
};

/**
 * Hook to retrieve active epics for a project
 */
export function useEpicsQuery(projectKey: string) {
  return useQuery({
    queryKey: epicKeys.byProject(projectKey),
    queryFn: () => epicsApi.list(projectKey),
    enabled: Boolean(projectKey && projectKey.trim().length > 0),
  });
}

/**
 * Mutation hook to create a new epic under a project
 * Automatically invalidates project hub details and epic lists upon success
 */
export function useCreateEpicMutation(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEpicBodyInput) => epicsApi.create(projectKey, input),
    onSuccess: () => {
      // Invalidate both the project hub (which embeds epics) and dedicated epic queries
      queryClient.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
      queryClient.invalidateQueries({ queryKey: epicKeys.byProject(projectKey) });
    },
  });
}
