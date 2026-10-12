import { apiClient } from "../../lib/api-client";
import type { Theme } from "@workmesh/shared";

export const themesApi = {
  /**
   * Fetch all preset themes from the database.
   */
  list: (): Promise<Theme[]> => {
    return apiClient.get<Theme[]>("/api/themes");
  },
};
