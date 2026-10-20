import { apiClient } from "../../lib/api-client";
import type { Feature, CreateFeatureBodyInput, FeatureStatus } from "@workmesh/shared";

export interface ListFeaturesQueryOptions {
  epicId?: number;
  status?: FeatureStatus;
}

export const featuresApi = {
  /**
   * Fetch active features for a project
   */
  list: (projectKey: string, options?: ListFeaturesQueryOptions): Promise<Feature[]> => {
    const params = new URLSearchParams();
    if (options?.epicId) params.append("epicId", String(options.epicId));
    if (options?.status) params.append("status", options.status);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<Feature[]>(`/api/projects/${encodeURIComponent(projectKey)}/features${query}`);
  },

  /**
   * Create a feature under a project and parent epic
   */
  create: (projectKey: string, input: CreateFeatureBodyInput): Promise<Feature> => {
    return apiClient.post<Feature>(`/api/projects/${encodeURIComponent(projectKey)}/features`, input);
  },

  /**
   * Approve a proposed feature (Human operator only)
   */
  approve: (featureId: number, notes?: string): Promise<Feature> => {
    return apiClient.patch<Feature>(`/api/features/${featureId}/approve`, notes ? { notes } : {});
  },

  /**
   * Reject a proposed feature with a required reason (Human operator only)
   */
  reject: (featureId: number, reason: string): Promise<Feature> => {
    return apiClient.patch<Feature>(`/api/features/${featureId}/reject`, { reason });
  },
};
