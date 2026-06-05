import type { Sensor } from "../types/sensor";
import { apiFetch, extractArray } from "./client";

export type SensorUpsertPayload = {
  name: string;
  pinCode?: number;
  sensorTypeId?: string | null;
  masterBoardId?: string | null;
};

function toSensor(item: Record<string, unknown>): Sensor {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    sensorTypeId: item.sensorTypeId
      ? String(item.sensorTypeId)
      : item.sensor_type_id
        ? String(item.sensor_type_id)
        : undefined,
    sensorTypeName:
      (item.sensorTypeName as string) ||
      (item.sensor_type_name as string) ||
      undefined,
    masterBoardId: item.masterBoardId
      ? String(item.masterBoardId)
      : item.master_board_id
        ? String(item.master_board_id)
        : undefined,
    masterBoardName:
      (item.masterBoardName as string) ||
      (item.master_board_name as string) ||
      undefined,
    pinCode:
      typeof item.pinCode === "number"
        ? item.pinCode
        : typeof item.pin_code === "number"
          ? item.pin_code
          : undefined,
  };
}

export async function getSensors(): Promise<Sensor[]> {
  const res = await apiFetch<unknown>("/hardwares/sensors");
  const items = extractArray(res);
  return items.map((i) => toSensor(i as Record<string, unknown>));
}

export async function createSensor(
  payload: SensorUpsertPayload,
): Promise<Sensor> {
  const body: Record<string, unknown> = { ...payload };
  const created = await apiFetch<Record<string, unknown>>(
    "/hardwares/sensors",
    { method: "POST", body },
  );
  return toSensor(created as Record<string, unknown>);
}

export async function updateSensor(
  id: string,
  payload: SensorUpsertPayload,
): Promise<Sensor | null> {
  const body: Record<string, unknown> = { ...payload };
  const updated = await apiFetch<Record<string, unknown>>(
    `/hardwares/sensors/${id}`,
    { method: "PUT", body },
  );
  if (!updated) return null;
  return toSensor(updated as Record<string, unknown>);
}

export async function deleteSensor(id: string): Promise<boolean> {
  await apiFetch(`/hardwares/sensors/${id}`, { method: "DELETE" });
  return true;
}

export default { getSensors, createSensor, updateSensor, deleteSensor };
