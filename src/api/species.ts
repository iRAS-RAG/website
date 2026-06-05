import type { Species } from "../types/species";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): Species {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
  };
}

export async function getSpecies(): Promise<Species[]> {
  const res = await apiFetch<unknown>("/species");
  if (Array.isArray(res)) {
    return (res as unknown[]).map((i) => toUi(i as Record<string, unknown>));
  }

  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    const obj = res as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) {
      return data.map((i) => toUi(i as Record<string, unknown>));
    }
  }

  return [];
}

export async function createSpecies(payload: Pick<Species, "name">): Promise<Species> {
  const body = { name: payload.name };
  const created = await apiFetch<Record<string, unknown>>("/species", { method: "POST", body });
  return toUi(created);
}

export async function updateSpecies(id: string, payload: Partial<Species>): Promise<Species | null> {
  const body: Record<string, unknown> = {};
  if (payload.name) body.name = payload.name;
  const updated = await apiFetch<Record<string, unknown>>(`/species/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toUi(updated);
}

export async function deleteSpecies(id: string): Promise<boolean> {
  await apiFetch(`/species/${id}`, { method: "DELETE" });
  return true;
}

export default { getSpecies, createSpecies, updateSpecies, deleteSpecies };
