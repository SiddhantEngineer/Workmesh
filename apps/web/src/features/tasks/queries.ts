import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./api";
import { projectKeys } from "../projects/queries";
import { featureKeys } from "../features/queries";
import type { ClaimTaskBodyInput } from "@workmesh/shared";

/**
 * Mutation hook to claim an actionable task.
 * Transitions ticket to IN_PROGRESS.
 * Immediately invalidates the project hub cache to update Kanban columns and counters.
 */
export function useClaimTaskMutation(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: number;
      input: ClaimTaskBodyInput;
    }) => tasksApi.claim(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
      queryClient.invalidateQueries({ queryKey: projectKeys.actionableTasks(projectKey) });
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
  });
}
