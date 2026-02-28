import { apiFetch } from "./client";

export type Species = { id: string; name: string; optimalTemp: string };

function toUi(item: Record<string, unknown>): Species {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    optimalTemp: String(item.optimalTemp ?? ""),
  };
}

export async function getSpecies(): Promise<Species[]> {
  const items = await apiFetch<unknown[]>("/species");
  if (!Array.isArray(items)) return [];
  return (items as unknown[]).map((i) => toUi(i as Record<string, unknown>));
}

export async function createSpecies(payload: Omit<Species, "id">): Promise<Species> {
  const body = { name: payload.name, optimalTemp: payload.optimalTemp };
  const created = await apiFetch<Record<string, unknown>>("/species", { method: "POST", body });
  return toUi(created);
}

export async function updateSpecies(id: string, payload: Partial<Species>): Promise<Species | null> {
  const body: Record<string, unknown> = {};
  if (payload.name) body.name = payload.name;
  if (payload.optimalTemp) body.optimalTemp = payload.optimalTemp;
  const updated = await apiFetch<Record<string, unknown>>(`/species/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toUi(updated);
}

export async function deleteSpecies(id: string): Promise<boolean> {
  await apiFetch(`/species/${id}`, { method: "DELETE" });
  return true;
}

export default { getSpecies, createSpecies, updateSpecies, deleteSpecies };
