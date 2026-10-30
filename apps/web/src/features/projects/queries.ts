import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./api";
import type { CreateProjectInput, ListActionableTasksQuery } from "@workmesh/shared";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  byKey: (key: string) => [...projectKeys.all, "byKey", key ? key.toUpperCase() : ""] as const,
  actionableTasks: (key: string, query?: ListActionableTasksQuery) =>
    [...projectKeys.all, "actionableTasks", key ? key.toUpperCase() : "", query || {}] as const,
};

/**
 * Hook to retrieve all active projects
 */
export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsApi.list(),
  });
}

/**
 * Hook to retrieve a single project by key prefix (e.g. "WM")
 */
export function useProjectByKeyQuery(key: string) {
  return useQuery({
    queryKey: projectKeys.byKey(key),
    queryFn: () => projectsApi.getByKey(key),
    enabled: Boolean(key && key.trim().length > 0),
  });
}

/**
 * Hook to retrieve prioritized actionable tasks for a project
 */
export function useActionableTasksQuery(
  key: string,
  query?: ListActionableTasksQuery
) {
  return useQuery({
    queryKey: projectKeys.actionableTasks(key, query),
    queryFn: () => projectsApi.listActionableTasks(key, query),
    enabled: Boolean(key && key.trim().length > 0),
  });
}

/**
 * Mutation hook to create a new project
 * Automatically invalidates project lists upon success
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
