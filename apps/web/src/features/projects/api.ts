import { apiClient } from "../../lib/api-client";
import type { Project, ProjectDetail, CreateProjectInput } from "@workmesh/shared";

export const projectsApi = {
  /**
   * Fetch all active projects
   */
  list: (): Promise<Project[]> => {
    return apiClient.get<Project[]>("/api/projects");
  },

  /**
   * Fetch a single project by key prefix (e.g. "WM")
   */
  getByKey: (key: string): Promise<ProjectDetail> => {
    return apiClient.get<ProjectDetail>(`/api/projects/${encodeURIComponent(key)}`);
  },

  /**
   * Create a new project with unique prefix key
   */
  create: (input: CreateProjectInput): Promise<Project> => {
    return apiClient.post<Project>("/api/projects", input);
  },
};
