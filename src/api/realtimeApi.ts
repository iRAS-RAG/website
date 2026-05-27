// src/api/realtimeApi.ts
import { apiFetch } from "./client";
import type { ILatestSensorData } from "../types/realtime";

export type TelemetryPush = {
  sensorId: string;
  tankId: string;
  value: number;
  timestamp: string;
  sensorTypeName: string | null;
};

export const realtimeApi = {
  // Lấy danh sách bể
  getTanks: async () => {
    return await apiFetch<unknown>("/fish-tanks?page=1&pageSize=50", {
      method: "GET",
    });
  },

  // Lấy chỉ số mới nhất của 1 bể
  getTankLatestData: async (tankId: string) => {
    return await apiFetch<ILatestSensorData[]>(
      `/fish-tanks/${tankId}/latest-data`,
      { method: "GET" },
    );
  },

  // Lấy danh sách thiết bị điều khiển của 1 bể
  getControlDevices: async (tankId: string) => {
    return await apiFetch<unknown>(
      `/hardwares/control-devices?TankId=${tankId}&page=1&pageSize=50`,
      { method: "GET" },
    );
  },

  // Lấy danh sách khuyến nghị AI
  getRecommendations: async () => {
    return await apiFetch<unknown>("/recommendations?page=1&pageSize=10", {
      method: "GET",
    });
  },

  // Bật tắt thiết bị thủ công
  toggleDevice: async (deviceId: string, state: boolean) => {
    return await apiFetch<unknown>(
      `/hardwares/control-devices/${deviceId}/toggle`,
      {
        method: "POST",
        body: { state },
      },
    );
  },
  getTelemetryWindow: async (tankId: string) => {
    return await apiFetch<TelemetryPush[]>(
      `/telemetry/tanks/${tankId}/window`,
      { method: "GET" },
    );
  },

  getSensorHistory: async (
    sensorId: string,
    from: string,
    to: string,
    interval: number = 120,
  ) => {
    return await apiFetch<unknown>(
      `/hardwares/sensors/${sensorId}/history?from=${from}&to=${to}&interval=${interval}`,
      { method: "GET" },
    );
  },
};
