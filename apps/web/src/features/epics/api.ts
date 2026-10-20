import { apiClient } from "../../lib/api-client";
import type { Epic, CreateEpicBodyInput } from "@workmesh/shared";

export const epicsApi = {
  /**
   * Fetch all active epics for a project by key
   */
  list: (projectKey: string): Promise<Epic[]> => {
    return apiClient.get<Epic[]>(`/api/projects/${encodeURIComponent(projectKey)}/epics`);
  },

  /**
   * Create an epic under a project
   */
  create: (projectKey: string, input: CreateEpicBodyInput): Promise<Epic> => {
    return apiClient.post<Epic>(`/api/projects/${encodeURIComponent(projectKey)}/epics`, input);
  },
};
