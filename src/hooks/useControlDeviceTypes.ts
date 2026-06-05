import { useEffect, useState } from "react";
import {
  createControlDeviceType,
  deleteControlDeviceType,
  getControlDeviceTypes,
  updateControlDeviceType,
} from "../api/control-device-types";
import type {
  ControlDeviceType,
  ControlDeviceTypeCreate,
} from "../types/control-device-type";

export default function useControlDeviceTypes() {
  const [items, setItems] = useState<ControlDeviceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getControlDeviceTypes()
      .then((d) => {
        if (!mounted) return;
        setItems(d);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  async function createItem(payload: ControlDeviceTypeCreate) {
    const created = await createControlDeviceType(payload);
    setItems((prev) => [...prev, created]);
    return created;
  }

  async function updateItem(
    id: string,
    payload: Partial<ControlDeviceTypeCreate>,
  ) {
    // 1. Gọi API để update dưới DB (bỏ qua giá trị trả về vì nó không có Data)
    await updateControlDeviceType(id, payload);

    // 2. Tự động merge dữ liệu vừa sửa (payload) đè lên item cũ trong State
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p)),
    );

    // 3. Trả về true hoặc object để Dialog biết là lưu thành công
    return { id, ...payload } as unknown as ControlDeviceType;
  }

  async function deleteItem(id: string) {
    await deleteControlDeviceType(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  return { items, loading, createItem, updateItem, deleteItem };
}
