import { apiClient } from "../../lib/api-client";
import type { ActionableTask, ClaimTaskBodyInput } from "@workmesh/shared";

export const tasksApi = {
  /**
   * Claim an actionable task (moves Feature or Bug to IN_PROGRESS).
   */
  claim: (taskId: number, input: ClaimTaskBodyInput): Promise<ActionableTask> => {
    return apiClient.patch<ActionableTask>(`/api/tasks/${taskId}/claim`, input);
  },
};
