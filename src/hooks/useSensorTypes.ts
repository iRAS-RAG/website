import { useEffect, useState } from "react";
import {
  createSensorType,
  deleteSensorType,
  getSensorTypes,
  updateSensorType,
} from "../api/sensor-types";
import type { SensorType, SensorTypeCreate } from "../types/sensor-type";

export default function useSensorTypes() {
  const [items, setItems] = useState<SensorType[]>([]);
  // SỬA: Khởi tạo loading là true mặc định
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Đã xóa setLoading(true) ở đây

    getSensorTypes()
      .then((d) => {
        if (!mounted) return;
        setItems(d);
      })
      .catch((error) => {
        console.error("Failed to fetch sensor types:", error);
      })
      .finally(() => {
        // SỬA: Thêm điều kiện if (mounted)
        if (mounted) setLoading(false);
      });

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
    // 1. Gọi API để update dưới DB
    await updateSensorType(id, payload);

    // 2. Tự động merge dữ liệu vừa sửa
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p)),
    );

    // THÊM "as unknown as SensorType" VÀO ĐÂY
    return { id, ...payload } as unknown as SensorType;
  }

  async function deleteItem(id: string) {
    await deleteSensorType(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  return { items, loading, createItem, updateItem, deleteItem };
}
