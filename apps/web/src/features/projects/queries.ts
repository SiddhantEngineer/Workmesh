import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./api";
import type { CreateProjectInput } from "@workmesh/shared";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
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
 * Hook to retrieve a single project by ID
 */
export function useProjectQuery(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: typeof id === "number" && !isNaN(id),
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
