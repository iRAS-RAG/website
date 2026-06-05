import { apiFetch } from "./client";

export const simulationApi = {
  /**
   * Start simulation mode for a masterboard MAC address.
   * Real MQTT data will be discarded and fake dangerous temperature (50°C) will be injected.
   */
  startSimulation: async (macAddress: string) => {
    return await apiFetch<{ message: string }>(
      `/telemetry/simulate/${encodeURIComponent(macAddress)}/start`,
      { method: "POST" },
    );
  },

  /**
   * Stop simulation mode for a masterboard MAC address.
   * Real MQTT data will resume processing.
   */
  stopSimulation: async (macAddress: string) => {
    return await apiFetch<{ message: string }>(
      `/telemetry/simulate/${encodeURIComponent(macAddress)}/stop`,
      { method: "POST" },
    );
  },

  /**
   * Get simulation status for a MAC address.
   */
  getSimulationStatus: async (macAddress: string) => {
    return await apiFetch<{ macAddress: string; isSimulating: boolean }>(
      `/telemetry/simulate/${encodeURIComponent(macAddress)}`,
      { method: "GET" },
    );
  },
};