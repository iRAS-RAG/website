import type { FeedType } from "../types/feed-type";
import { apiFetch } from "./client";

function toUi(item: Record<string, unknown>): FeedType {
  const pct = typeof item.proteinPercentage === "number" ? (item.proteinPercentage as number) : undefined;
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    protein: typeof pct === "number" ? `${pct}%` : String(item.protein ?? ""),
    description: (item.description as string) || undefined,
    manufacturer: (item.manufacturer as string) || undefined,
    proteinPercentage: pct,
  };
}

type RawListResponse = { data?: unknown[]; meta?: Record<string, unknown>; links?: Record<string, unknown> } | unknown[];

export async function getFeedTypes(params?: Record<string, unknown>): Promise<{ items: FeedType[]; meta?: Record<string, unknown>; links?: Record<string, unknown> }> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => typeof v !== "undefined" && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const res = await apiFetch<RawListResponse>(`/feed-types${qs}`);
  let items: unknown[] = [];
  let meta: Record<string, unknown> | undefined = undefined;
  let links: Record<string, unknown> | undefined = undefined;

  if (Array.isArray(res)) items = res;
  else if (res && typeof res === "object") {
    const resObj = res as Record<string, unknown>;
    const maybeData = resObj["data"];
    if (Array.isArray(maybeData)) items = maybeData as unknown[];
    if (resObj["meta"] && typeof resObj["meta"] === "object") meta = resObj["meta"] as Record<string, unknown>;
    if (resObj["links"] && typeof resObj["links"] === "object") links = resObj["links"] as Record<string, unknown>;
  }

  if (!Array.isArray(items)) items = [];
  return { items: items.map((i) => toUi(i as Record<string, unknown>)), meta, links };
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
