import { useEffect, useState } from "react";
import { createSensor, getSensors, updateSensor } from "../api/sensors";
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
        masterBoardId: value.masterBoardId ?? undefined,
      });
      if (!updated) throw new Error("Update failed");
      setSensors((prev) => prev.map((sensor) => (sensor.id === updated.id ? updated : sensor)));
      return;
    }

    const created = await createSensor({
      name: value.name,
      pinCode: value.pinCode,
      masterBoardId: value.masterBoardId ?? undefined,
    });
    setSensors((prev) => [...prev, created]);
  }

  return {
    loading,
    sensors,
    handleSaveSensor,
  } as const;
}
