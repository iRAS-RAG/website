import { apiFetch } from "./client";
import type {
  ICorrectiveAction,
  ICreateCorrectiveAction,
  IPaginatedResponse,
} from "../types/corrective-action";

export const correctiveActionApi = {
  // Lấy danh sách (Nối query string trực tiếp vào URL vì apiFetch không hỗ trợ tham số params riêng)
  getAll: async (page = 1, pageSize = 100) => {
    const url = `/corrective-actions?page=${page}&pageSize=${pageSize}`;
    return await apiFetch<IPaginatedResponse<ICorrectiveAction>>(url, {
      method: "GET",
    });
  },

  // Tạo mới
  create: async (data: ICreateCorrectiveAction) => {
    return await apiFetch<ICorrectiveAction>("/corrective-actions", {
      method: "POST",
      body: data,
    });
  },

  // Cập nhật (nếu sau này cần)
  update: async (id: string, data: Partial<ICreateCorrectiveAction>) => {
    return await apiFetch<{ message: string }>(`/corrective-actions/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  // Xóa
  delete: async (id: string) => {
    return await apiFetch<{ message: string }>(`/corrective-actions/${id}`, {
      method: "DELETE",
    });
  },
};
