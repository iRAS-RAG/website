import { useEffect, useState } from "react";
import { createSensorType, deleteSensorType, getSensorTypes, updateSensorType } from "../api/sensor-types";
import type { SensorType, SensorTypeCreate } from "../types/sensor-type";

export default function useSensorTypes() {
  const [items, setItems] = useState<SensorType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSensorTypes()
      .then((d) => {
        if (!mounted) return;
        setItems(d);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function createItem(payload: SensorTypeCreate) {
    const created = await createSensorType(payload);
    setItems((prev) => [...prev, created]);
    return created;
  }

  async function updateItem(id: string, payload: Partial<SensorTypeCreate>) {
    const updated = await updateSensorType(id, payload);
    if (!updated) return null;
    setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async function deleteItem(id: string) {
    await deleteSensorType(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  return { items, loading, createItem, updateItem, deleteItem };
}
