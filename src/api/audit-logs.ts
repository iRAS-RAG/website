import { apiFetch, extractArray } from "./client";
import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
} from "../types/audit-log";

function toAuditLog(item: Record<string, unknown>): AuditLog {
  return {
    id: String(item.id ?? ""),
    userId: String(item.userId ?? item.user_id ?? ""),
    firstName: (item.firstName as string) || (item.first_name as string) || undefined,
    lastName: (item.lastName as string) || (item.last_name as string) || undefined,
    email: String(item.email ?? ""),
    action: String(item.action ?? ""),
    entityType: String(item.entityType ?? item.entity_type ?? ""),
    entityId: String(item.entityId ?? item.entity_id ?? ""),
    oldValue:
      item.oldValue === null
        ? null
        : (item.oldValue as string) || (item.old_value as string) || undefined,
    newValue:
      item.newValue === null
        ? null
        : (item.newValue as string) || (item.new_value as string) || undefined,
    timestamp: String(item.timestamp ?? ""),
  };
}

function buildQuery(params?: AuditLogQueryParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  if (params.page) sp.append("page", String(params.page));
  if (params.pageSize) sp.append("pageSize", String(params.pageSize));
  if (params.userId) sp.append("userId", params.userId);
  if (params.action) sp.append("action", params.action);
  if (params.entityType) sp.append("entityType", params.entityType);
  if (params.entityId) sp.append("entityId", params.entityId);
  if (params.fromDate) sp.append("fromDate", params.fromDate);
  if (params.toDate) sp.append("toDate", params.toDate);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

interface RawAuditResp {
  items?: unknown[];
  data?: unknown[];
  meta?: AuditLogListResponse["meta"];
}

export const auditLogApi = {
  getAll: async (params?: AuditLogQueryParams): Promise<AuditLogListResponse> => {
    const res = await apiFetch<unknown>(`/audit-logs${buildQuery(params)}`);
    let rawItems: unknown[] = [];
    let meta: AuditLogListResponse["meta"] | undefined;

    if (Array.isArray(res)) {
      rawItems = res;
    } else if (res && typeof res === "object") {
      const r = res as RawAuditResp;
      rawItems = r.items ?? r.data ?? extractArray(res);
      meta = r.meta;
    }

    const items = rawItems.map((i) => toAuditLog(i as Record<string, unknown>));
    return { items, meta };
  },

  exportCsvUrl: (params?: AuditLogQueryParams): string =>
    `/audit-logs/export${buildQuery(params)}`,
};

export default auditLogApi;
