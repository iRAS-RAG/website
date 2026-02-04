import { apiFetch } from "./client";

export type FeedType = {
  id: string;
  name: string;
  protein: string; // display string like '45%'
  description?: string;
  weightPerUnit?: number;
  manufacturer?: string;
  proteinPercentage?: number;
};

function toUi(item: any): FeedType {
  const pct = typeof item.proteinPercentage === "number" ? item.proteinPercentage : undefined;
  return {
    id: item.id,
    name: item.name,
    protein: typeof pct === "number" ? `${pct}%` : item.protein || "",
    description: item.description,
    weightPerUnit: item.weightPerUnit,
    manufacturer: item.manufacturer,
    proteinPercentage: pct,
  };
}

export async function fetchFeeds(): Promise<FeedType[]> {
  const res = await apiFetch("/feed-types");
  const items = (res as any)?.data ?? res;
  if (!Array.isArray(items)) return [];
  return items.map(toUi);
}

export async function createFeed(payload: Omit<FeedType, "id">): Promise<FeedType> {
  // try to extract numeric percentage
  let proteinPercentage: number | undefined;
  if (typeof payload.protein === "string") {
    const m = payload.protein.match(/(\d+)/);
    if (m) proteinPercentage = parseInt(m[1], 10);
  }
  const body: any = {
    name: payload.name,
    description: payload.description ?? "",
    weightPerUnit: payload.weightPerUnit ?? 25,
    proteinPercentage: proteinPercentage ?? payload.proteinPercentage ?? null,
    manufacturer: payload.manufacturer ?? "",
  };
  const res = await apiFetch("/feed-types", { method: "POST", body });
  const created = (res as any)?.data ?? res;
  return toUi(created);
}

export async function updateFeed(id: string, payload: Partial<FeedType>): Promise<FeedType | null> {
  const body: any = {};
  if (payload.name) body.name = payload.name;
  if (payload.description) body.description = payload.description;
  if (typeof payload.weightPerUnit !== "undefined") body.weightPerUnit = payload.weightPerUnit;
  if (typeof payload.protein !== "undefined") {
    const m = String(payload.protein).match(/(\d+)/);
    if (m) body.proteinPercentage = parseInt(m[1], 10);
  }
  if (typeof payload.manufacturer !== "undefined") body.manufacturer = payload.manufacturer;
  const res = await apiFetch(`/feed-types/${id}`, { method: "PUT", body });
  const updated = (res as any)?.data ?? res;
  if (!updated) return null;
  return toUi(updated);
}

export async function deleteFeed(id: string): Promise<boolean> {
  await apiFetch(`/feed-types/${id}`, { method: "DELETE" });
  return true;
}

export default { fetchFeeds, createFeed, updateFeed, deleteFeed };
