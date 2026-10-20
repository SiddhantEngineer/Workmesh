import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featuresApi, type ListFeaturesQueryOptions } from "./api";
import { projectKeys } from "../projects/queries";
import type { CreateFeatureBodyInput } from "@workmesh/shared";

export const featureKeys = {
  all: ["features"] as const,
  byProject: (projectKey: string) =>
    [...featureKeys.all, "byProject", projectKey ? projectKey.toUpperCase() : ""] as const,
};

/**
 * Hook to retrieve features for a project
 */
export function useFeaturesQuery(
  projectKey: string,
  options?: ListFeaturesQueryOptions
) {
  return useQuery({
    queryKey: [...featureKeys.byProject(projectKey), options],
    queryFn: () => featuresApi.list(projectKey, options),
    enabled: Boolean(projectKey && projectKey.trim().length > 0),
  });
}

/**
 * Mutation hook to create a new feature under a project and epic
 * Automatically invalidates project hub details and feature queries upon success
 */
export function useCreateFeatureMutation(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFeatureBodyInput) => featuresApi.create(projectKey, input),
    onSuccess: () => {
      // Invalidate project hub query to instantly update Kanban columns and counters
      queryClient.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
      queryClient.invalidateQueries({ queryKey: featureKeys.byProject(projectKey) });
    },
  });
}

/**
 * Mutation hook to approve a proposed feature.
 * Immediately invalidates the project hub cache to move the card to Approved column.
 */
export function useApproveFeatureMutation(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, notes }: { featureId: number; notes?: string }) =>
      featuresApi.approve(featureId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
      queryClient.invalidateQueries({ queryKey: featureKeys.byProject(projectKey) });
    },
  });
}

/**
 * Mutation hook to reject a proposed feature with a reason.
 * Immediately invalidates the project hub cache to update columns.
 */
export function useRejectFeatureMutation(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, reason }: { featureId: number; reason: string }) =>
      featuresApi.reject(featureId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
      queryClient.invalidateQueries({ queryKey: featureKeys.byProject(projectKey) });
    },
  });
}
