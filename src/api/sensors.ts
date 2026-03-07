import type { Sensor } from "../types/sensor";
import { apiFetch, extractArray } from "./client";

function toSensor(item: Record<string, unknown>): Sensor {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    sensorTypeName: (item.sensorTypeName as string) || (item.sensor_type_name as string) || undefined,
    masterBoardId: item.masterBoardId ? String(item.masterBoardId) : item.master_board_id ? String(item.master_board_id) : undefined,
    masterBoardName: (item.masterBoardName as string) || (item.master_board_name as string) || undefined,
    pinCode: typeof item.pinCode === "number" ? item.pinCode : typeof item.pin_code === "number" ? item.pin_code : undefined,
  };
}

export async function getSensors(): Promise<Sensor[]> {
  const res = await apiFetch<unknown>("/hardware/sensors");
  const items = extractArray(res);
  return items.map((i) => toSensor(i as Record<string, unknown>));
}

export async function createSensor(payload: Partial<Sensor>): Promise<Sensor> {
  const body: Record<string, unknown> = { ...payload };
  const created = await apiFetch<Record<string, unknown>>("/hardware/sensors", { method: "POST", body });
  return toSensor(created as Record<string, unknown>);
}

export async function updateSensor(id: string, payload: Partial<Sensor>): Promise<Sensor | null> {
  const body: Record<string, unknown> = { ...payload };
  const updated = await apiFetch<Record<string, unknown>>(`/hardware/sensors/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toSensor(updated as Record<string, unknown>);
}

export default { getSensors, createSensor, updateSensor };
