import type { ControlDevice } from "../types/control-device";
import { apiFetch, extractArray } from "./client";

export type ControlDeviceUpsertPayload = {
  name: string;
  pinCode?: number;
  masterBoardId?: string | null;
  controlDeviceTypeId?: string | null;
  state?: boolean;
  commandOn?: string;
  commandOff?: string;
};

function toControlDevice(item: Record<string, unknown>): ControlDevice {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    controlDeviceTypeId: item.controlDeviceTypeId ? String(item.controlDeviceTypeId) : item.control_device_type_id ? String(item.control_device_type_id) : undefined,
    controlDeviceTypeName: (item.controlDeviceTypeName as string) || (item.control_device_type_name as string) || undefined,
    masterBoardId: item.masterBoardId ? String(item.masterBoardId) : item.master_board_id ? String(item.master_board_id) : undefined,
    masterBoardName: (item.masterBoardName as string) || (item.master_board_name as string) || undefined,
    pinCode: typeof item.pinCode === "number" ? item.pinCode : typeof item.pin_code === "number" ? item.pin_code : undefined,
    state: typeof item.state === "boolean" ? item.state : undefined,
    commandOn: (item.commandOn as string) || (item.command_on as string) || undefined,
    commandOff: (item.commandOff as string) || (item.command_off as string) || undefined,
  };
}

export async function getControlDevices(): Promise<ControlDevice[]> {
  const res = await apiFetch<unknown>("/hardware/control-devices");
  const items = extractArray(res);
  return items.map((i) => toControlDevice(i as Record<string, unknown>));
}

export async function createControlDevice(payload: ControlDeviceUpsertPayload): Promise<ControlDevice> {
  const body: Record<string, unknown> = { ...payload };
  const created = await apiFetch<Record<string, unknown>>("/hardware/control-devices", { method: "POST", body });
  return toControlDevice(created as Record<string, unknown>);
}

export async function updateControlDevice(id: string, payload: ControlDeviceUpsertPayload): Promise<ControlDevice | null> {
  const body: Record<string, unknown> = { ...payload };
  const updated = await apiFetch<Record<string, unknown>>(`/hardware/control-devices/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toControlDevice(updated as Record<string, unknown>);
}

export async function deleteControlDevice(id: string): Promise<boolean> {
  await apiFetch(`/hardware/control-devices/${id}`, { method: "DELETE" });
  return true;
}

export default { getControlDevices, createControlDevice, updateControlDevice, deleteControlDevice };
