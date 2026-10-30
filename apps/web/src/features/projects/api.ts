import { apiClient } from "../../lib/api-client";
import type {
  Project,
  ProjectDetail,
  CreateProjectInput,
  ActionableTask,
  ListActionableTasksQuery,
} from "@workmesh/shared";

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
   * Fetch prioritized actionable tasks (approved features and open bugs)
   */
  listActionableTasks: (
    key: string,
    query?: ListActionableTasksQuery
  ): Promise<ActionableTask[]> => {
    const params = new URLSearchParams();
    if (query?.epicId) params.set("epicId", String(query.epicId));
    if (query?.status) params.set("status", query.status);
    if (query?.ticketType && query.ticketType !== "ALL") {
      params.set("ticketType", query.ticketType);
    }
    const queryString = params.toString();
    const endpoint = `/api/projects/${encodeURIComponent(key)}/actionable-tasks${
      queryString ? `?${queryString}` : ""
    }`;
    return apiClient.get<ActionableTask[]>(endpoint);
  },

  /**
   * Create a new project with unique prefix key
   */
  create: (input: CreateProjectInput): Promise<Project> => {
    return apiClient.post<Project>("/api/projects", input);
  },
};
