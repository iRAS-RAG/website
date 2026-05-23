// src/api/alerts.ts
import type { IAlert, IAlertListRequest } from "../types/alert";
import { apiFetch } from "./client";

export const alertApi = {
  // Lấy danh sách cảnh báo có phân trang
  getAll: async (params: IAlertListRequest) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.status !== undefined) query.append("status", params.status.toString());
    // server expects TankId query param for filtering by tank
    if (params.tankId) query.append("TankId", params.tankId);

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

  // Xóa cảnh báo
  delete: async (id: string) => {
    return await apiFetch<{ message: string }>(`/alerts/${id}`, {
      method: "DELETE",
    });
  },
};
