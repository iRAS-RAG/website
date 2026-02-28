import type { SpeciesThreshold, SpeciesThresholdCreate } from "../types/species-threshold";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): SpeciesThreshold {
  return {
    id: String(item.id ?? ""),
    speciesName: item.speciesName ? String(item.speciesName) : undefined,
    growthStageName: item.growthStageName ? String(item.growthStageName) : undefined,
    sensorTypeName: item.sensorTypeName ? String(item.sensorTypeName) : undefined,
    minValue: item.minValue !== undefined ? Number(item.minValue) : undefined,
    maxValue: item.maxValue !== undefined ? Number(item.maxValue) : undefined,
  };
}

export async function getSpeciesThresholds(): Promise<SpeciesThreshold[]> {
  const res = await apiFetch<unknown>("/species-threshholds");
  if (Array.isArray(res)) return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>));

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data.map((i) => toUi(i as Record<string, unknown>));
  }

  return [];
}

export async function getSpeciesThreshold(id: string): Promise<SpeciesThreshold | null> {
  try {
    const res = await apiFetch<unknown>(`/species-threshholds/${id}`);
    if (!res) return null;
    if (Array.isArray(res)) return toUi(res[0] as Record<string, unknown>);
    if (typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
      const obj = res as Record<string, unknown>;
      const inner = obj.data;
      if (inner && typeof inner === "object") return toUi(inner as Record<string, unknown>);
    }
    if (typeof res === "object") return toUi(res as Record<string, unknown>);
  } catch (e) {
    // ignore
  }
  return null;
}

export async function createSpeciesThreshold(payload: SpeciesThresholdCreate): Promise<SpeciesThreshold> {
  const body = { ...payload };
  const created = await apiFetch<Record<string, unknown>>("/species-threshholds", { method: "POST", body });
  if (!created) throw new Error("Failed to create species threshold");
  if (created && typeof created === "object" && Object.prototype.hasOwnProperty.call(created, "data")) {
    const inner = (created as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(created as Record<string, unknown>);
}

export async function updateSpeciesThreshold(id: string, payload: Partial<SpeciesThresholdCreate>): Promise<SpeciesThreshold | null> {
  const body: Record<string, unknown> = {};
  Object.assign(body, payload);
  const updated = await apiFetch<Record<string, unknown>>(`/species-threshholds/${id}`, { method: "PUT", body });
  if (!updated) return null;
  if (typeof updated === "object" && Object.prototype.hasOwnProperty.call(updated, "data")) {
    const inner = (updated as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(updated as Record<string, unknown>);
}

export async function deleteSpeciesThreshold(id: string): Promise<boolean> {
  await apiFetch(`/species-threshholds/${id}`, { method: "DELETE" });
  return true;
}

export default { getSpeciesThresholds, getSpeciesThreshold, createSpeciesThreshold, updateSpeciesThreshold, deleteSpeciesThreshold };
