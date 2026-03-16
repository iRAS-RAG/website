import { useEffect, useState, useCallback } from "react";
import { getTanks, getTankLatestData } from "../api/tanks";
import type { Tank } from "../types/tank";
import type { SensorTelemetry } from "../types/sensor";

// Định nghĩa kiểu dữ liệu mở rộng cho Dashboard
export interface TankWithSensors extends Tank {
  latestData: SensorTelemetry[];
  status: "Normal" | "Warning" | "Danger";
}

export default function useRealTimeTanks() {
  const [loading, setLoading] = useState<boolean>(true);
  const [tanksData, setTanksData] = useState<TankWithSensors[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const tanks = await getTanks();
      const detailedTanks = await Promise.all(
        tanks.map(async (tank) => {
          try {
            const response = await getTankLatestData(tank.id);
            const sensors = response.data || [];
            const overallStatus = sensors.some((s) => s.status === "Danger")
              ? "Danger"
              : sensors.some((s) => s.status === "Warning")
                ? "Warning"
                : "Normal";

            return {
              ...tank,
              latestData: sensors,
              status: overallStatus as "Normal" | "Warning" | "Danger",
            };
          } catch (err) {
            console.error(`Lỗi tải dữ liệu bể ${tank.id}:`, err);
            return { ...tank, latestData: [], status: "Normal" as const };
          }
        }),
      );

      setTanksData(detailedTanks);
    } catch (error) {
      console.error("Lỗi đồng bộ Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return { loading, tanksData, refresh: fetchDashboardData };
}
