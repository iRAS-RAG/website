import type { GrowthStage } from "../types/growth-stage";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): GrowthStage {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    description: item.description ? String(item.description) : undefined,
  };
}

export async function getGrowthStages(): Promise<GrowthStage[]> {
  const res = await apiFetch<unknown>("/growth-stages");
  if (Array.isArray(res)) return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>));

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data.map((i) => toUi(i as Record<string, unknown>));
  }

  return [];
}

export async function getGrowthStage(id: string): Promise<GrowthStage | null> {
  try {
    const res = await apiFetch<unknown>(`/growth-stages/${id}`);
    if (!res) return null;
    if (Array.isArray(res)) return toUi(res[0] as Record<string, unknown>);
    if (typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
      const obj = res as Record<string, unknown>;
      const inner = obj.data;
      if (inner && typeof inner === "object") return toUi(inner as Record<string, unknown>);
    }
    if (typeof res === "object") return toUi(res as Record<string, unknown>);
  } catch (e) {
    console.error("Failed to fetch growth stage", e);
  }
  return null;
}

export async function createGrowthStage(payload: { name: string; description?: string }): Promise<GrowthStage> {
  const body = { name: payload.name, description: payload.description };
  const created = await apiFetch<Record<string, unknown>>("/growth-stages", { method: "POST", body });
  if (!created) throw new Error("Failed to create growth stage");
  // created may be wrapped
  if (created && typeof created === "object" && Object.prototype.hasOwnProperty.call(created, "data")) {
    const inner = (created as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(created as Record<string, unknown>);
}

export async function updateGrowthStage(id: string, payload: Partial<{ name: string; description: string }>): Promise<GrowthStage | null> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  const updated = await apiFetch<Record<string, unknown>>(`/growth-stages/${id}`, { method: "PUT", body });
  if (!updated) return null;
  if (typeof updated === "object" && Object.prototype.hasOwnProperty.call(updated, "data")) {
    const inner = (updated as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(updated as Record<string, unknown>);
}

export async function deleteGrowthStage(id: string): Promise<boolean> {
  await apiFetch(`/growth-stages/${id}`, { method: "DELETE" });
  return true;
}

export default { getGrowthStages, getGrowthStage, createGrowthStage, updateGrowthStage, deleteGrowthStage };
