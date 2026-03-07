import type { Tank } from "../types/tank";
import { apiFetch, extractArray } from "./client";

function toTank(item: Record<string, unknown>): Tank {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    height: typeof item.height === "number" ? item.height : undefined,
    radius: typeof item.radius === "number" ? item.radius : undefined,
    farmId: (item.farmId as string) || (item.farm_id as string) || undefined,
    farmName: (item.farmName as string) || (item.farm_name as string) || undefined,
    topicCode: (item.topicCode as string) || (item.topic_code as string) || undefined,
    cameraUrl: (item.cameraUrl as string) || (item.camera_url as string) || undefined,
  };
}

export async function getTanks(): Promise<Tank[]> {
  const res = await apiFetch<unknown>("/tanks");
  const items = extractArray(res);
  return items.map((i) => toTank(i as Record<string, unknown>));
}

export async function createTank(payload: Partial<Tank>): Promise<Tank | null> {
  const body: Record<string, unknown> = { ...payload };
  const created = await apiFetch<Record<string, unknown>>("/tanks", { method: "POST", body });
  if (!created) return null;
  return toTank(created as Record<string, unknown>);
}

export async function updateTank(id: string, payload: Partial<Tank>): Promise<Tank | null> {
  const body: Record<string, unknown> = { ...payload };
  const updated = await apiFetch<Record<string, unknown>>(`/tanks/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toTank(updated as Record<string, unknown>);
}

export async function deleteTank(id: string): Promise<boolean> {
  await apiFetch(`/tanks/${id}`, { method: "DELETE" });
  return true;
}

export default { getTanks, createTank, updateTank, deleteTank };
