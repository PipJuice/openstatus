import { AuditLog, Tinybird } from "@openstatus/tinybird";
import { getLogger } from "@logtape/logtape";

import { env } from "../env";

const tb = new Tinybird({ token: env().TINY_BIRD_API_KEY });
const logger = getLogger(["workflow", "audit"]);

export const checkerAudit = new AuditLog({ tb });

export async function publishAuditLogSafely(
  payload: Parameters<typeof checkerAudit.publishAuditLog>[0],
) {
  try {
    await checkerAudit.publishAuditLog(payload);
  } catch (error) {
    const firstEntry = Array.isArray(payload) ? payload[0] : payload;

    logger.warn("Audit log publish failed", {
      action: firstEntry?.action,
      target_id: firstEntry?.id,
      error_message: error instanceof Error ? error.message : String(error),
    });
  }
}
