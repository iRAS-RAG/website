import { apiFetch } from "./client";

export type Species = { id: string; name: string; optimalTemp: string };

function toUi(item: Record<string, unknown>): Species {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    optimalTemp: String(item.optimalTemp ?? ""),
  };
}

export async function fetchSpecies(): Promise<Species[]> {
  const res = await apiFetch("/species");
  const items = (res as unknown as { data?: unknown })?.data ?? res;
  if (!Array.isArray(items)) return [];
  return (items as unknown[]).map((i) => toUi(i as Record<string, unknown>));
}

export async function createSpecies(payload: Omit<Species, "id">): Promise<Species> {
  const body = { name: payload.name, optimalTemp: payload.optimalTemp };
  const res = await apiFetch("/species", { method: "POST", body });
  const created = (res as unknown as { data?: unknown })?.data ?? res;
  return toUi(created as Record<string, unknown>);
}

export async function updateSpecies(id: string, payload: Partial<Species>): Promise<Species | null> {
  const body: Record<string, unknown> = {};
  if (payload.name) body.name = payload.name;
  if (payload.optimalTemp) body.optimalTemp = payload.optimalTemp;
  const res = await apiFetch(`/species/${id}`, { method: "PUT", body });
  const updated = (res as unknown as { data?: unknown })?.data ?? res;
  if (!updated) return null;
  return toUi(updated as Record<string, unknown>);
}

export async function deleteSpecies(id: string): Promise<boolean> {
  await apiFetch(`/species/${id}`, { method: "DELETE" });
  return true;
}

export default { fetchSpecies, createSpecies, updateSpecies, deleteSpecies };
