import { apiClient } from "../../lib/api-client";
import type { Project, CreateProjectInput } from "@workmesh/shared";

export const projectsApi = {
  /**
   * Fetch all active projects
   */
  list: (): Promise<Project[]> => {
    return apiClient.get<Project[]>("/api/projects");
  },

  /**
   * Fetch a single project by numeric ID or key
   */
  getById: (id: number): Promise<Project> => {
    return apiClient.get<Project>(`/api/projects/${id}`);
  },

  /**
   * Create a new project with unique prefix key
   */
  create: (input: CreateProjectInput): Promise<Project> => {
    return apiClient.post<Project>("/api/projects", input);
  },
};
