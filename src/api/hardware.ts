import type { ControlDevice, MasterBoard, Sensor, SensorType, Tank } from "../types/hardware";
import { apiFetch } from "./client";

function extractArray(res: unknown): unknown[] {
  if (Array.isArray(res)) return res as unknown[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const data = obj["data"];
    if (Array.isArray(data)) return data as unknown[];
  }
  return [];
}

function toSensorType(item: Record<string, unknown>): SensorType {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    description: (item.description as string) || undefined,
  };
}

function toMasterBoard(item: Record<string, unknown>): MasterBoard {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    macAddress: (item.macAddress as string) || (item.mac_address as string) || undefined,
    fishTankName: (item.fishTankName as string) || (item.fish_tank_name as string) || undefined,
  };
}

function toSensor(item: Record<string, unknown>): Sensor {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    sensorTypeName: (item.sensorTypeName as string) || (item.sensor_type_name as string) || undefined,
    masterBoardId: item.masterBoardId ? String(item.masterBoardId) : item.master_board_id ? String(item.master_board_id) : undefined,
    masterBoardName: (item.masterBoardName as string) || (item.master_board_name as string) || undefined,
    pinCode: typeof item.pinCode === "number" ? (item.pinCode as number) : typeof item.pin_code === "number" ? (item.pin_code as number) : undefined,
  };
}

function toControlDevice(item: Record<string, unknown>): ControlDevice {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    controlDeviceTypeName: (item.controlDeviceTypeName as string) || (item.control_device_type_name as string) || undefined,
    masterBoardId: item.masterBoardId ? String(item.masterBoardId) : item.master_board_id ? String(item.master_board_id) : undefined,
    masterBoardName: (item.masterBoardName as string) || (item.master_board_name as string) || undefined,
    pinCode: typeof item.pinCode === "number" ? (item.pinCode as number) : typeof item.pin_code === "number" ? (item.pin_code as number) : undefined,
    state: typeof item.state === "boolean" ? (item.state as boolean) : undefined,
    commandOn: (item.commandOn as string) || (item.command_on as string) || undefined,
    commandOff: (item.commandOff as string) || (item.command_off as string) || undefined,
  };
}

function toTank(item: Record<string, unknown>): Tank {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    height: typeof item.height === "number" ? (item.height as number) : undefined,
    radius: typeof item.radius === "number" ? (item.radius as number) : undefined,
    farmId: (item.farmId as string) || (item.farm_id as string) || undefined,
    farmName: (item.farmName as string) || (item.farm_name as string) || undefined,
    topicCode: (item.topicCode as string) || (item.topic_code as string) || undefined,
    cameraUrl: (item.cameraUrl as string) || (item.camera_url as string) || undefined,
  };
}

export async function getTanks(): Promise<Tank[]> {
  const res = await apiFetch<unknown>("/tanks");
  const items = extractArray(res);
  if (!Array.isArray(items)) return [];
  return items.map((i) => toTank(i as Record<string, unknown>));
}

export async function getSensorTypes(): Promise<SensorType[]> {
  const res = await apiFetch<unknown>("/hardware/sensor-types");
  const items = extractArray(res);
  if (!Array.isArray(items)) return [];
  return items.map((i) => toSensorType(i as Record<string, unknown>));
}

export async function getMasterBoards(): Promise<MasterBoard[]> {
  const res = await apiFetch<unknown>("/hardware/masterboards");
  const items = extractArray(res);
  if (!Array.isArray(items)) return [];
  return items.map((i) => toMasterBoard(i as Record<string, unknown>));
}

export async function createMasterBoard(payload: Partial<MasterBoard>): Promise<MasterBoard> {
  const body: Record<string, unknown> = {
    name: payload.name ?? "",
    macAddress: payload.macAddress ?? null,
    fishTankName: payload.fishTankName ?? null,
  };
  const created = await apiFetch<Record<string, unknown>>("/hardware/masterboards", { method: "POST", body });
  return toMasterBoard(created as Record<string, unknown>);
}

export async function updateMasterBoard(id: string, payload: Partial<MasterBoard>): Promise<MasterBoard | null> {
  const body: Record<string, unknown> = {
    name: payload.name ?? "",
    macAddress: payload.macAddress ?? null,
    fishTankName: payload.fishTankName ?? null,
  };
  const updated = await apiFetch<Record<string, unknown>>(`/hardware/masterboards/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toMasterBoard(updated as Record<string, unknown>);
}

export async function getSensors(): Promise<Sensor[]> {
  const res = await apiFetch<unknown>("/hardware/sensors");
  const items = extractArray(res);
  if (!Array.isArray(items)) return [];
  return items.map((i) => toSensor(i as Record<string, unknown>));
}

export async function createSensor(payload: Partial<Sensor>): Promise<Sensor> {
  const body: Record<string, unknown> = Object.assign({}, payload as Record<string, unknown>);
  const created = await apiFetch<Record<string, unknown>>("/hardware/sensors", { method: "POST", body });
  return toSensor(created as Record<string, unknown>);
}

export async function updateSensor(id: string, payload: Partial<Sensor>): Promise<Sensor | null> {
  const body: Record<string, unknown> = Object.assign({}, payload as Record<string, unknown>);
  const updated = await apiFetch<Record<string, unknown>>(`/hardware/sensors/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toSensor(updated as Record<string, unknown>);
}

export async function getControlDevices(): Promise<ControlDevice[]> {
  const res = await apiFetch<unknown>("/hardware/control-devices");
  const items = extractArray(res);
  if (!Array.isArray(items)) return [];
  return items.map((i) => toControlDevice(i as Record<string, unknown>));
}

export async function createControlDevice(payload: Partial<ControlDevice>): Promise<ControlDevice> {
  const body: Record<string, unknown> = Object.assign({}, payload as Record<string, unknown>);
  const created = await apiFetch<Record<string, unknown>>("/hardware/control-devices", { method: "POST", body });
  return toControlDevice(created as Record<string, unknown>);
}

export async function updateControlDevice(id: string, payload: Partial<ControlDevice>): Promise<ControlDevice | null> {
  const body: Record<string, unknown> = Object.assign({}, payload as Record<string, unknown>);
  const updated = await apiFetch<Record<string, unknown>>(`/hardware/control-devices/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toControlDevice(updated as Record<string, unknown>);
}

export async function updateTank(id: string, payload: Partial<Tank>): Promise<Tank | null> {
  const body: Record<string, unknown> = Object.assign({}, payload as Record<string, unknown>);
  const updated = await apiFetch<Record<string, unknown>>(`/tanks/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toTank(updated as Record<string, unknown>);
}

export default {
  getTanks,
  getSensorTypes,
  getMasterBoards,
  createMasterBoard,
  getSensors,
  createSensor,
  updateSensor,
  getControlDevices,
  createControlDevice,
};
