import { useEffect, useState } from "react";
import { apiFetch, extractArray } from "../api/client";
import { toUiUser } from "../api/users";
import { documentApi } from "../api/documents";
import { getControlDevices } from "../api/control-devices";
import { getSensors } from "../api/sensors";
import { auditLogApi } from "../api/audit-logs";
import type { AuditLog } from "../types/audit-log";
import type { User } from "../types/user";

export interface AdminDashboardStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  activeUsersToday: number;
  totalDocuments: number;
  totalDevices: number;
  runningDevices: number;
  totalSensors: number;
}

interface PagedResp {
  items?: unknown[];
  data?: unknown[];
  meta?: { totalItems?: number };
}

function countItems(res: unknown): number {
  if (Array.isArray(res)) return res.length;
  if (res && typeof res === "object") {
    const r = res as PagedResp;
    if (r.meta?.totalItems != null) return r.meta.totalItems;
    if (Array.isArray(r.items)) return r.items.length;
    if (Array.isArray(r.data)) return r.data.length;
  }
  return 0;
}

// Fetch users theo cách bền vững: hỗ trợ cả response dạng array thuần và
// dạng paginated wrapper `{items, meta}` mà /users của BE thực tế trả về.
async function fetchUsersRobust(): Promise<User[]> {
  try {
    const res = await apiFetch<unknown>("/users?page=1&pageSize=1000");
    const rawItems = extractArray(res);
    return rawItems.map((i) => toUiUser(i as Record<string, unknown>));
  } catch (err) {
    console.error("Lỗi tải danh sách user:", err);
    return [];
  }
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    usersByRole: {},
    activeUsersToday: 0,
    totalDocuments: 0,
    totalDevices: 0,
    runningDevices: 0,
    totalSensors: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [users, docs, devices, sensors, todayLogs, recentLogs] =
          await Promise.all([
            fetchUsersRobust(),
            documentApi.getDocuments({ page: 1, pageSize: 1 }).catch(() => null),
            getControlDevices().catch(() => []),
            getSensors().catch(() => []),
            auditLogApi
              .getAll({
                page: 1,
                pageSize: 100,
                fromDate: startOfTodayIso(),
                toDate: endOfTodayIso(),
              })
              .catch(() => ({ items: [] })),
            auditLogApi
              .getAll({ page: 1, pageSize: 10 })
              .catch(() => ({ items: [] })),
          ]);

        if (!mounted) return;

        const usersByRole: Record<string, number> = {};
        for (const u of users) {
          const role = u.role || "Unknown";
          usersByRole[role] = (usersByRole[role] ?? 0) + 1;
        }

        const uniqueActiveUsers = new Set(
          todayLogs.items.map((l) => l.userId).filter(Boolean),
        );

        const runningDevices = devices.filter((d) => d.state === true).length;

        setStats({
          totalUsers: users.length,
          usersByRole,
          activeUsersToday: uniqueActiveUsers.size,
          totalDocuments: countItems(docs),
          totalDevices: devices.length,
          runningDevices,
          totalSensors: sensors.length,
        });
        setRecentActivity(recentLogs.items);
      } catch (err) {
        console.error("Lỗi tải Admin dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { stats, recentActivity, loading };
};
