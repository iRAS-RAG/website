import { apiFetch } from "./client";

export type FeedType = {
  id: string;
  name: string;
  protein: string;
  description?: string;
  weightPerUnit?: number;
  manufacturer?: string;
  proteinPercentage?: number;
};

function toUi(item: Record<string, unknown>): FeedType {
  const pct = typeof item.proteinPercentage === "number" ? (item.proteinPercentage as number) : undefined;
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    protein: typeof pct === "number" ? `${pct}%` : String(item.protein ?? ""),
    description: (item.description as string) || undefined,
    weightPerUnit: typeof item.weightPerUnit === "number" ? (item.weightPerUnit as number) : undefined,
    manufacturer: (item.manufacturer as string) || undefined,
    proteinPercentage: pct,
  };
}

export async function getFeedTypes(): Promise<FeedType[]> {
  const items = await apiFetch<unknown[]>("/feed-types");
  if (!Array.isArray(items)) return [];
  return (items as unknown[]).map((i) => toUi(i as Record<string, unknown>));
}

export async function createFeedType(payload: Omit<FeedType, "id">): Promise<FeedType> {
  let proteinPercentage: number | undefined;
  if (typeof payload.protein === "string") {
    const m = payload.protein.match(/(\d+)/);
    if (m) proteinPercentage = parseInt(m[1], 10);
  }
  const body: Record<string, unknown> = {
    name: payload.name,
    description: payload.description ?? "",
    weightPerUnit: payload.weightPerUnit ?? 25,
    proteinPercentage: proteinPercentage ?? payload.proteinPercentage ?? null,
    manufacturer: payload.manufacturer ?? "",
  };
  const created = await apiFetch<Record<string, unknown>>("/feed-types", { method: "POST", body });
  return toUi(created);
}

export async function updateFeedType(id: string, payload: Partial<FeedType>): Promise<FeedType | null> {
  const body: Record<string, unknown> = {};
  if (payload.name) body.name = payload.name;
  if (payload.description) body.description = payload.description;
  if (typeof payload.weightPerUnit !== "undefined") body.weightPerUnit = payload.weightPerUnit;
  if (typeof payload.protein !== "undefined") {
    const m = String(payload.protein).match(/(\d+)/);
    if (m) body.proteinPercentage = parseInt(m[1], 10);
  }
  if (typeof payload.manufacturer !== "undefined") body.manufacturer = payload.manufacturer;
  const updated = await apiFetch<Record<string, unknown>>(`/feed-types/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toUi(updated);
}

export async function deleteFeedType(id: string): Promise<boolean> {
  await apiFetch(`/feed-types/${id}`, { method: "DELETE" });
  return true;
}

export default { getFeedTypes, createFeedType, updateFeedType, deleteFeedType };
