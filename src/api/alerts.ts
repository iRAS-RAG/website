// src/api/alerts.ts
import type { IAlert, IAlertListRequest } from "../types/alert";
import { apiFetch } from "./client";

export const alertApi = {
  // Lấy danh sách cảnh báo có phân trang
  getAll: async (params: IAlertListRequest) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.statuses?.length) params.statuses.forEach((s) => query.append("statuses", s.toString()));
    // server expects TankId query param for filtering by tank
    if (params.tankId) query.append("TankId", params.tankId);
    if (params.farmingBatchId) query.append("BatchId", params.farmingBatchId);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortDir) query.append("sortDir", params.sortDir);

    const url = `/alerts?${query.toString()}`;
    return await apiFetch<unknown>(url, { method: "GET" });
  },

  // Lấy chi tiết 1 cảnh báo
  getById: async (id: string) => {
    return await apiFetch<IAlert>(`/alerts/${id}`, { method: "GET" });
  },

  // Cập nhật trạng thái cảnh báo (dùng khi xử lý xong)
  update: async (id: string, data: Partial<IAlert>) => {
    return await apiFetch<{ message: string }>(`/alerts/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  updateStatus: async (id: string, status: "Acknowledged" | "Dismissed") => {
    return await apiFetch<{ message: string }>(`/alerts/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  // Xóa cảnh báo
  delete: async (id: string) => {
    return await apiFetch<{ message: string }>(`/alerts/${id}`, {
      method: "DELETE",
    });
  },

  // Lấy khuyến nghị AI được tạo tự động cho cảnh báo
  getRecommendation: async (alertId: string) => {
    return await apiFetch<{ data: { id: string; suggestionText: string; alertId: string } }>(
      `/recommendations/by-alert/${alertId}`,
      { method: "GET" },
    );
  },
};
