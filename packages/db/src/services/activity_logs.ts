import { type DB } from "../client";
import { activityLogs, type ActivityLogDetails } from "../schema/activity_logs";

export type DbOrTx = DB | Parameters<Parameters<DB["transaction"]>[0]>[0];

export interface RecordActivityInput {
  projectId: number;
  entityType: "PROJECT" | "EPIC" | "FEATURE" | "BUG";
  entityId: number;
  action: string;
  details?: ActivityLogDetails;
}

/**
 * Records an activity log entry within the provided DB client or active transaction.
 */
export async function recordActivity(
  runner: DbOrTx,
  input: RecordActivityInput
) {
  return await runner.insert(activityLogs).values({
    projectId: input.projectId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    details: input.details ?? {},
  });
}
