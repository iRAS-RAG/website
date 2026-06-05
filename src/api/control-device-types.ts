import type {
  ControlDeviceType,
  ControlDeviceTypeCreate,
} from "../types/control-device-type";
import { apiFetch, extractArray } from "./client";

function toUi(item: Record<string, unknown>): ControlDeviceType {
  return {
    id: String(item.id ?? ""),
    name: item.name ? String(item.name) : "",
    description:
      item.description != null ? String(item.description) : undefined,
  };
}

export async function getControlDeviceTypes(): Promise<ControlDeviceType[]> {
  const res = await apiFetch<unknown>("/hardwares/control-device-types");
  const items = extractArray(res);
  return items.map((i) => toUi(i as Record<string, unknown>));
}

export async function createControlDeviceType(
  payload: ControlDeviceTypeCreate,
): Promise<ControlDeviceType> {
  const body: Record<string, unknown> = { ...payload };
  const created = await apiFetch<Record<string, unknown>>(
    "/hardwares/control-device-types",
    { method: "POST", body },
  );
  if (!created) throw new Error("Failed to create control device type");
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

export async function updateControlDeviceType(
  id: string,
  payload: Partial<ControlDeviceTypeCreate>,
): Promise<ControlDeviceType | null> {
  const body: Record<string, unknown> = {};
  Object.assign(body, payload);
  const updated = await apiFetch<Record<string, unknown>>(
    `/hardwares/control-device-types/${id}`,
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

export async function deleteControlDeviceType(id: string): Promise<boolean> {
  await apiFetch(`/hardwares/control-device-types/${id}`, { method: "DELETE" });
  return true;
}

export default { getControlDeviceTypes, createControlDeviceType };
