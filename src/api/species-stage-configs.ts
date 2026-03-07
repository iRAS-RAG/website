import type { SpeciesStageConfig, SpeciesStageConfigCreate } from "../types/species-stage-config";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): SpeciesStageConfig {
  return {
    id: String(item.id ?? ""),
    speciesId: item.speciesId ? String(item.speciesId) : undefined,
    speciesName: item.speciesName ? String(item.speciesName) : undefined,
    growthStageId: item.growthStageId ? String(item.growthStageId) : undefined,
    growthStageName: item.growthStageName ? String(item.growthStageName) : undefined,
    feedTypeId: item.feedTypeId ? String(item.feedTypeId) : undefined,
    feedTypeName: item.feedTypeName ? String(item.feedTypeName) : undefined,
    amountPer100Fish: item.amountPer100Fish !== undefined ? Number(item.amountPer100Fish) : undefined,
    frequencyPerDay: item.frequencyPerDay !== undefined ? Number(item.frequencyPerDay) : undefined,
    maxStockingDensity: item.maxStockingDensity !== undefined ? Number(item.maxStockingDensity) : undefined,
    expectedDurationDays: item.expectedDurationDays !== undefined ? Number(item.expectedDurationDays) : undefined,
  };
}

export async function getSpeciesStageConfigs(searchTerm?: string): Promise<SpeciesStageConfig[]> {
  const path = searchTerm ? `/config/species-stage-configs?SearchTerm=${encodeURIComponent(searchTerm)}` : "/config/species-stage-configs";
  const res = await apiFetch<unknown>(path);
  if (Array.isArray(res)) return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>));

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data.map((i) => toUi(i as Record<string, unknown>));
  }

  return [];
}

export async function getSpeciesStageConfig(id: string): Promise<SpeciesStageConfig | null> {
  try {
    const res = await apiFetch<unknown>(`/config/species-stage-configs/${id}`);
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

export async function createSpeciesStageConfig(payload: SpeciesStageConfigCreate): Promise<SpeciesStageConfig> {
  const body = { ...payload };
  const created = await apiFetch<Record<string, unknown>>("/config/species-stage-configs", { method: "POST", body });
  if (!created) throw new Error("Failed to create species stage config");
  if (created && typeof created === "object" && Object.prototype.hasOwnProperty.call(created, "data")) {
    const inner = (created as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(created as Record<string, unknown>);
}

export async function updateSpeciesStageConfig(id: string, payload: Partial<SpeciesStageConfigCreate>): Promise<SpeciesStageConfig | null> {
  const body: Record<string, unknown> = {};
  Object.assign(body, payload);
  const updated = await apiFetch<Record<string, unknown>>(`/config/species-stage-configs/${id}`, { method: "PUT", body });
  if (!updated) return null;
  if (typeof updated === "object" && Object.prototype.hasOwnProperty.call(updated, "data")) {
    const inner = (updated as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (inner) return toUi(inner);
  }
  return toUi(updated as Record<string, unknown>);
}

export async function deleteSpeciesStageConfig(id: string): Promise<boolean> {
  await apiFetch(`/config/species-stage-configs/${id}`, { method: "DELETE" });
  return true;
}

export default { getSpeciesStageConfigs, getSpeciesStageConfig, createSpeciesStageConfig, updateSpeciesStageConfig, deleteSpeciesStageConfig };
