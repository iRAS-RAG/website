import type { LatestDataResponse, SensorLogResponse } from "../types/sensor";
import type { Tank } from "../types/tank";
import { apiFetch, extractArray } from "./client";

function toTank(item: Record<string, unknown>): Tank {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    height: typeof item.height === "number" ? item.height : undefined,
    radius: typeof item.radius === "number" ? item.radius : undefined,
    farmId: (item.farmId as string) || (item.farm_id as string) || undefined,
    farmName: (item.farmName as string) || (item.farm_name as string) || undefined,
    topicCode: (item.topicCode as string) || (item.topic_code as string) || undefined,
    cameraUrl: (item.cameraUrl as string) || (item.camera_url as string) || undefined,
  };
}

export async function getTanks(): Promise<Tank[]> {
  // SỬA: /tanks -> /fish-tanks
  const res = await apiFetch<unknown>("/fish-tanks");
  const items = extractArray(res);
  return items.map((i) => toTank(i as Record<string, unknown>));
}

export async function createTank(payload: Partial<Tank>): Promise<Tank | null> {
  const body: Record<string, unknown> = { ...payload };
  // SỬA: /tanks -> /fish-tanks
  const created = await apiFetch<Record<string, unknown>>("/fish-tanks", {
    method: "POST",
    body,
  });
  if (!created) return null;
  return toTank(created as Record<string, unknown>);
}

export async function updateTank(id: string, payload: Partial<Tank>): Promise<Tank | null> {
  const body: Record<string, unknown> = { ...payload };
  // SỬA: /tanks -> /fish-tanks
  const updated = await apiFetch<Record<string, unknown>>(`/fish-tanks/${id}`, {
    method: "PUT",
    body,
  });
  if (!updated) return null;
  return toTank(updated as Record<string, unknown>);
}

export async function deleteTank(id: string): Promise<boolean> {
  // SỬA: /tanks -> /fish-tanks
  await apiFetch(`/fish-tanks/${id}`, { method: "DELETE" });
  return true;
}

/**
 * Lấy dữ liệu cảm biến mới nhất của một bể cụ thể
 * [HttpGet("{id}/latest-data")] trong FishTankController
 */
export async function getTankLatestData(id: string): Promise<LatestDataResponse> {
  // SỬA: tanks -> /fish-tanks (Thêm dấu / ở đầu cho chuẩn format)
  return await apiFetch<LatestDataResponse>(`/fish-tanks/${id}/latest-data`);
}

/**
 * Lấy mức khuyến nghị số lượng ban đầu cho từng loài ở một bể cụ thể
 * Endpoint: GET /fish-tanks/{id}/recommended-initials
 * Trả về mapping speciesId -> recommendedInitial (number|null)
 */
export async function getTankRecommendedInitials(id: string): Promise<Record<string, number | null>> {
  try {
    const res = await apiFetch<unknown>(`/fish-tanks/${id}/recommended-initials`);
    if (!res) return {};

    // Nếu backend trả về mảng: [{ speciesId, speciesName, recommendedInitial }, ...]
    if (Array.isArray(res)) {
      const arr = res as Array<Record<string, unknown>>;
      const map: Record<string, number | null> = {};
      for (const item of arr) {
        const sid = String(item.speciesId ?? item.species_id ?? (item.species as any)?.id ?? "");
        const raw = (item.recommendedInitial as unknown) ?? (item.recommended_initial as unknown) ?? null;
        map[sid] = raw === null || raw === undefined ? null : Number(raw as unknown as number);
      }
      return map;
    }

    // Nếu backend trả về object mapping hoặc object có cấu trúc khác
    if (typeof res === "object") {
      const obj = res as Record<string, unknown>;
      const map: Record<string, number | null> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "number") map[k] = v;
        else if (v === null || v === undefined) map[k] = null;
        else if (typeof v === "string" && v.trim() !== "") {
          const n = Number(v);
          map[k] = Number.isNaN(n) ? null : n;
        } else if (typeof v === "object" && v !== null) {
          const rv = (v as Record<string, unknown>).recommendedInitial ?? (v as Record<string, unknown>).recommended_initial;
          map[k] = rv === undefined || rv === null ? null : Number(rv as unknown as number);
        } else {
          map[k] = null;
        }
      }
      return map;
    }

    return {};
  } catch (e) {
    console.error("Error fetching recommended initials for tank:", e);
    return {};
  }
}

/**
 * Lấy lịch sử log cảm biến để vẽ biểu đồ
 * [HttpGet("{id}/logs")] trong SensorController
 */
export async function getSensorLogs(sensorId: string, params?: { page: number; pageSize: number }): Promise<SensorLogResponse> {
  // Tạo chuỗi query string từ object params
  const queryString = params ? `?page=${params.page}&pageSize=${params.pageSize}` : "";

  // SensorController nên đường dẫn /sensors giữ nguyên
  return await apiFetch<SensorLogResponse>(
    `/sensors/${sensorId}/logs${queryString}`,
    { method: "GET" }, // FETCH_OPTIONS mặc định thường chỉ nhận method, headers, body
  );
}

export default { getTanks, createTank, updateTank, deleteTank };
