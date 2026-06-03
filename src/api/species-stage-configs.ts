import type { SpeciesStageConfig, SpeciesStageConfigCreate } from "../types/species-stage-config";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): SpeciesStageConfig {
  return {
    id: String(item.id ?? ""),
    speciesId: item.speciesId ? String(item.speciesId) : undefined,
    speciesName: item.speciesName ? String(item.speciesName) : undefined,
    growthStageId: item.growthStageId ? String(item.growthStageId) : undefined,
    growthStageName: item.growthStageName ? String(item.growthStageName) : undefined,
    // Support multiple feed types (new backend shape)
    feedTypeIds: Array.isArray(item.feedTypeIds) ? (item.feedTypeIds as unknown[]).map((v) => String(v)) : item.feedTypeId ? [String(item.feedTypeId)] : undefined,
    feedTypeNames: Array.isArray(item.feedTypeNames) ? (item.feedTypeNames as unknown[]).map((v) => String(v)) : item.feedTypeName ? [String(item.feedTypeName)] : undefined,
    sequence: item.sequence !== undefined && item.sequence !== null ? Number(item.sequence) : undefined,
    amountPer100Fish: item.amountPer100Fish !== undefined ? Number(item.amountPer100Fish) : undefined,
    frequencyPerDay: item.frequencyPerDay !== undefined ? Number(item.frequencyPerDay) : undefined,
    maxStockingDensity: item.maxStockingDensity !== undefined ? Number(item.maxStockingDensity) : undefined,
    expectedDurationDays: item.expectedDurationDays !== undefined ? Number(item.expectedDurationDays) : undefined,
    expectedWeightKgPerFish: item.expectedWeightKgPerFish !== undefined ? Number(item.expectedWeightKgPerFish) : undefined,
    survivalRate: item.survivalRate !== undefined ? Number(item.survivalRate) : undefined,
    thresholds: Array.isArray(item.thresholds)
      ? (item.thresholds as unknown[]).map((t) => {
          const th = t as Record<string, unknown>;
          return {
            sensorTypeId: String(th.sensorTypeId ?? ""),
            sensorTypeName: String(th.sensorTypeName ?? ""),
            minValue: Number(th.minValue ?? 0),
            maxValue: Number(th.maxValue ?? 0),
            unitOfMeasure: String(th.unitOfMeasure ?? ""),
          };
        })
      : undefined,
  };
}

export async function getSpeciesStageConfigs(searchTerm?: string): Promise<SpeciesStageConfig[]> {
  const path = searchTerm ? `/config/species-stage-configs?SearchTerm=${encodeURIComponent(searchTerm)}` : "/config/species-stage-configs";
  const res = await apiFetch<unknown>(path);
  if (Array.isArray(res)) return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>)).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data.map((i) => toUi(i as Record<string, unknown>)).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }

  return [];
}

export async function getSpeciesStageConfigsBySpecies(speciesId: string): Promise<SpeciesStageConfig[]> {
  if (!speciesId) return [];
  const path = `/config/species-stage-configs/by-species/${encodeURIComponent(speciesId)}`;
  const res = await apiFetch<unknown>(path);
  if (Array.isArray(res)) return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>)).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) return data.map((i) => toUi(i as Record<string, unknown>)).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
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
  } catch {
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

export async function reorderSpeciesStageConfigs(speciesId: string, orderedIds: string[]): Promise<SpeciesStageConfig[]> {
  const res = await apiFetch<unknown>(`/config/species-stage-configs/reorder`, {
    method: "PUT",
    body: { speciesId, orderedIds },
  });
  const items = Array.isArray(res) ? res : res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data") ? (res as Record<string, unknown>).data : null;
  if (Array.isArray(items)) return (items as unknown[]).map((i) => toUi(i as Record<string, unknown>)).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  return [];
}

export default {
  getSpeciesStageConfigs,
  getSpeciesStageConfigsBySpecies,
  getSpeciesStageConfig,
  createSpeciesStageConfig,
  updateSpeciesStageConfig,
  deleteSpeciesStageConfig,
  reorderSpeciesStageConfigs,
};
