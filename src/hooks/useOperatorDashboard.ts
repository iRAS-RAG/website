import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";

export interface DashboardStats {
  totalTanks: number;
  totalBatches: number;
  totalSensors: number;
  totalDevices: number;
  totalMaintenance: number;
}

interface ApiMeta {
  totalItems?: number;
}

interface ApiPayload {
  meta?: ApiMeta;
  items?: unknown[];
}

type FetchResponse = ApiPayload | unknown[];

export const useOperatorDashboard = (tankId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTanks: 0,
    totalBatches: 0,
    totalSensors: 0,
    totalDevices: 0,
    totalMaintenance: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const safeGetCount = async (url: string): Promise<number> => {
          try {
            const res = await apiFetch<FetchResponse>(`${url}?page=1&pageSize=1`);

            if (Array.isArray(res)) return res.length;
            if (res && typeof res === "object") {
              if (res.meta && typeof res.meta.totalItems === "number")
                return res.meta.totalItems;
              if (res.items && Array.isArray(res.items))
                return res.items.length;
            }
            return 0;
          } catch (err) {
            console.error(`Lỗi tải API ${url}:`, err);
            return 0;
          }
        };

        // Khi đã chọn bể cụ thể: lọc batch & sensor theo fishTankId
        const batchesUrl = tankId
          ? `/batches?fishTankId=${tankId}`
          : `/batches`;
        const sensorsUrl = tankId
          ? `/hardwares/sensors?fishTankId=${tankId}`
          : `/hardwares/sensors`;

        const [tanks, batches, sensors, devices, maintenance] =
          await Promise.all([
            safeGetCount("/fish-tanks"),
            safeGetCount(batchesUrl),
            safeGetCount(sensorsUrl),
            safeGetCount("/hardwares/control-devices"),
            safeGetCount("/corrective-actions"),
          ]);

        setStats({
          totalTanks: tanks,
          totalBatches: batches,
          totalSensors: sensors,
          totalDevices: devices,
          totalMaintenance: maintenance,
        });
      } catch (error) {
        console.error("Lỗi đồng bộ thống kê Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [tankId]); // re-fetch khi đổi bể

  return { stats, loading };
};
