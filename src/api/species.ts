import { apiFetch } from "./client";

export type Species = { id: string; name: string; optimalTemp: string };

function toUi(item: any): Species {
  return {
    id: item.id,
    name: item.name,
    optimalTemp: item.optimalTemp || "",
  };
}

export async function fetchSpecies(): Promise<Species[]> {
  const res = await apiFetch("/species");
  const items = (res as any)?.data ?? res;
  if (!Array.isArray(items)) return [];
  return items.map(toUi);
}

export async function createSpecies(payload: Omit<Species, "id">): Promise<Species> {
  const body = { name: payload.name, optimalTemp: payload.optimalTemp };
  const res = await apiFetch("/species", { method: "POST", body });
  const created = (res as any)?.data ?? res;
  return toUi(created);
}

export async function updateSpecies(id: string, payload: Partial<Species>): Promise<Species | null> {
  const body: any = {};
  if (payload.name) body.name = payload.name;
  if (payload.optimalTemp) body.optimalTemp = payload.optimalTemp;
  const res = await apiFetch(`/species/${id}`, { method: "PUT", body });
  const updated = (res as any)?.data ?? res;
  if (!updated) return null;
  return toUi(updated);
}

export async function deleteSpecies(id: string): Promise<boolean> {
  await apiFetch(`/species/${id}`, { method: "DELETE" });
  return true;
}

export default { fetchSpecies, createSpecies, updateSpecies, deleteSpecies };
