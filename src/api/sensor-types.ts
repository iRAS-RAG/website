import type { SensorType, SensorTypeCreate } from "../types/sensor-type";
import { apiFetch, extractArray } from "./client";

function toUi(item: Record<string, unknown>): SensorType {
  return {
    id: String(item.id ?? ""),
    name: item.name ? String(item.name) : "",
    measureType: item.measureType ? String(item.measureType) : undefined,
    unitOfMeasure: item.unitOfMeasure ? String(item.unitOfMeasure) : undefined,
    code: item.code ? String(item.code) : undefined,
  };
}

export async function getSensorType(id: string): Promise<SensorType | null> {
  try {
    const res = await apiFetch<unknown>(`/hardwares/sensor-types/${id}`);
    if (!res) return null;
    if (typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
      const inner = (res as Record<string, unknown>).data as Record<string, unknown> | undefined;
      if (inner) return toUi(inner);
    }
    return toUi(res as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getSensorTypes(): Promise<SensorType[]> {
  const res = await apiFetch<unknown>("/hardwares/sensor-types");
  const items = extractArray(res);
  return items.map((i) => toUi(i as Record<string, unknown>));
}

export async function createSensorType(
  payload: SensorTypeCreate,
): Promise<SensorType> {
  const body = { ...payload };
  const created = await apiFetch<Record<string, unknown>>(
    "/hardwares/sensor-types",
    { method: "POST", body },
  );
  if (!created) throw new Error("Failed to create sensor type");
  if (
    created &&
    typeof created === "object" &&
    Object.prototype.hasOwnProperty.call(created, "data")
  ) {
    const inner = (created as Record<string, unknown>).data as
      | Record<string, unknown>
      | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(created as Record<string, unknown>);
}

export async function updateSensorType(
  id: string,
  payload: Partial<SensorTypeCreate>,
): Promise<SensorType | null> {
  const body: Record<string, unknown> = {};
  Object.assign(body, payload);
  const updated = await apiFetch<Record<string, unknown>>(
    `/hardwares/sensor-types/${id}`,
    { method: "PUT", body },
  );
  if (!updated) return null;
  if (
    typeof updated === "object" &&
    Object.prototype.hasOwnProperty.call(updated, "data")
  ) {
    const inner = (updated as Record<string, unknown>).data as
      | Record<string, unknown>
      | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(updated as Record<string, unknown>);
}

export async function deleteSensorType(id: string): Promise<boolean> {
  await apiFetch(`/hardwares/sensor-types/${id}`, { method: "DELETE" });
  return true;
}

export default {
  getSensorTypes,
  createSensorType,
  updateSensorType,
  deleteSensorType,
};
