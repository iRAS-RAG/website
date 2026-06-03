import { useEffect, useMemo, useState } from "react";
import { alertApi } from "../api/alerts";
import { getBatches } from "../api/batches";
import { apiFetch, extractArray } from "../api/client";
import { getControlDevices } from "../api/control-devices";
import type { IAlert } from "../types/alert";
import type { Batch } from "../types/batch";

export interface AlertStats {
  open: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  total: number;
}

export interface BatchStats {
  active: number;
  harvested: number;
  terminated: number;
  paused: number;
  total: number;
}

export interface DeviceStats {
  running: number;
  stopped: number;
  total: number;
}

// Kept for backward compat
export interface DashboardStats {
  openAlerts: number;
  activeBatches: number;
  runningDevices: number;
  totalDevices: number;
}

export type DayFilter = "all" | "today" | "7" | "30";

function getFromDate(filter: DayFilter): Date | null {
  if (filter === "all") return null;
  const now = new Date();
  if (filter === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const d = new Date(now);
  d.setDate(d.getDate() - parseInt(filter));
  d.setHours(0, 0, 0, 0);
  return d;
}

export const useOperatorDashboard = (
  tankId?: string,
  alertDays: DayFilter = "today",
  batchDays: DayFilter = "today",
) => {
  const [allAlerts, setAllAlerts] = useState<IAlert[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({ running: 0, stopped: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [alertsRes, batchesData, devices] = await Promise.all([
          alertApi.getAll({ page: 1, pageSize: 100, tankId }).catch(() => null),
          getBatches().catch(() => [] as Batch[]),
          getControlDevices().catch(() => []),
        ]);

        // Extract alerts from various response shapes
        const alertsArr = extractArray(alertsRes) as IAlert[];
        setAllAlerts(alertsArr);

        setAllBatches(batchesData);

        const running = devices.filter((d) => d.state === true).length;
        setDeviceStats({ running, stopped: devices.length - running, total: devices.length });
      } catch (error) {
        console.error("Lỗi đồng bộ thống kê Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [tankId]);

  // Alert stats filtered by date + optional tank
  const alertStats = useMemo((): AlertStats => {
    const from = getFromDate(alertDays);
    const list = allAlerts.filter((a) => {
      if (from !== null) {
        const d = new Date(a.raisedAt);
        if (isNaN(d.getTime()) || d < from) return false;
      }
      if (tankId && a.fishTankId !== tankId) return false;
      return true;
    });
    const s: AlertStats = { open: 0, acknowledged: 0, resolved: 0, dismissed: 0, total: list.length };
    for (const a of list) {
      const st = String(a.status ?? "").toUpperCase();
      if (st === "OPEN") s.open++;
      else if (st === "ACKNOWLEDGED") s.acknowledged++;
      else if (st === "RESOLVED") s.resolved++;
      else if (st === "DISMISSED") s.dismissed++;
    }
    return s;
  }, [allAlerts, alertDays, tankId]);

  // Batch stats filtered by startDate + optional tank
  const batchStats = useMemo((): BatchStats => {
    const from = getFromDate(batchDays);
    const list = allBatches.filter((b) => {
      if (from !== null) {
        const d = new Date(b.startDate);
        if (isNaN(d.getTime()) || d < from) return false;
      }
      if (tankId && b.fishTankId !== tankId) return false;
      return true;
    });
    const s: BatchStats = { active: 0, harvested: 0, terminated: 0, paused: 0, total: list.length };
    for (const b of list) {
      const st = String(b.status ?? "").toUpperCase();
      if (st === "ACTIVE") s.active++;
      else if (st === "HARVESTED") s.harvested++;
      else if (st === "TERMINATED") s.terminated++;
      else if (st === "PAUSED") s.paused++;
    }
    return s;
  }, [allBatches, batchDays, tankId]);

  // Active batches for TankPulseCard (unchanged from before)
  const batches = useMemo(() => {
    return allBatches.filter((b) => {
      if (String(b.status).toUpperCase() !== "ACTIVE") return false;
      if (tankId && b.fishTankId !== tankId) return false;
      return true;
    });
  }, [allBatches, tankId]);

  // Backward-compat stats object
  const stats: DashboardStats = {
    openAlerts: alertStats.open,
    activeBatches: batches.length,
    runningDevices: deviceStats.running,
    totalDevices: deviceStats.total,
  };

  return { stats, alertStats, batchStats, deviceStats, batches, loading };
};

// Keep old helper export
export { apiFetch };
