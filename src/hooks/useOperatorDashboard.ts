import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";
import { alertApi } from "../api/alerts";
import { getBatches } from "../api/batches";
import { getControlDevices } from "../api/control-devices";
import type { Batch } from "../types/batch";

export interface DashboardStats {
  openAlerts: number;
  activeBatches: number;
  runningDevices: number;
  totalDevices: number;
}

interface ApiMeta {
  totalItems?: number;
}

interface ApiPayload {
  meta?: ApiMeta;
  items?: unknown[];
  data?: unknown[];
}

type FetchResponse = ApiPayload | unknown[];

function extractCount(res: FetchResponse | unknown): number {
  if (Array.isArray(res)) return res.length;
  if (res && typeof res === "object") {
    const r = res as ApiPayload;
    if (r.meta && typeof r.meta.totalItems === "number") return r.meta.totalItems;
    if (Array.isArray(r.items)) return r.items.length;
    if (Array.isArray(r.data)) return r.data.length;
  }
  return 0;
}

export const useOperatorDashboard = (tankId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    openAlerts: 0,
    activeBatches: 0,
    runningDevices: 0,
    totalDevices: 0,
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [alertsRes, activeBatches, devices] = await Promise.all([
          alertApi
            .getAll({ page: 1, pageSize: 1, status: "OPEN", tankId })
            .catch(() => null),
          getBatches("ACTIVE").catch(() => [] as Batch[]),
          getControlDevices().catch(() => []),
        ]);

        const filteredBatches = tankId
          ? activeBatches.filter((b) => b.fishTankId === tankId)
          : activeBatches;

        const runningDevices = devices.filter((d) => d.state === true).length;

        setStats({
          openAlerts: extractCount(alertsRes),
          activeBatches: filteredBatches.length,
          runningDevices,
          totalDevices: devices.length,
        });
        setBatches(filteredBatches);
      } catch (error) {
        console.error("Lỗi đồng bộ thống kê Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [tankId]);

  return { stats, batches, loading };
};

// Giữ lại helper cũ để khỏi break các nơi khác đang import
export { apiFetch };
