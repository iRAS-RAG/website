import { useEffect, useState } from "react";
import { createSensor, deleteSensor, getSensors, updateSensor } from "../api/sensors";
import type { Sensor } from "../types/sensor";

export type SensorSaveInput = {
  name: string;
  pinCode?: number;
  sensorTypeId?: string | null;
  masterBoardId?: string | null;
};

export default function useSensors() {
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getSensors();
        if (!mounted) return;
        setSensors(data);
      } catch (error) {
        console.error("Failed to load sensors:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveSensor(value: SensorSaveInput, editingSensorId?: string | null) {
    if (editingSensorId) {
      const updated = await updateSensor(editingSensorId, {
        name: value.name,
        pinCode: value.pinCode,
        sensorTypeId: value.sensorTypeId ?? undefined,
        masterBoardId: value.masterBoardId ?? undefined,
      });
      if (!updated) throw new Error("Update failed");
      const refreshed = await getSensors();
      setSensors(refreshed);
      return;
    }

    await createSensor({
      name: value.name,
      pinCode: value.pinCode,
      sensorTypeId: value.sensorTypeId ?? undefined,
      masterBoardId: value.masterBoardId ?? undefined,
    });
    const refreshed = await getSensors();
    setSensors(refreshed);
  }

  async function handleDeleteSensor(id?: string | null) {
    if (!id) throw new Error("No sensor selected");
    await deleteSensor(id);
    setSensors((prev) => prev.filter((sensor) => sensor.id !== id));
  }

  return {
    loading,
    sensors,
    handleSaveSensor,
    handleDeleteSensor,
  } as const;
}
