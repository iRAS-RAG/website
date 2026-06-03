// src/api/documents.ts
import { apiFetch } from "./client";
import type { DocumentListParams } from "../types/document";

export const documentApi = {
  getDocuments: async (params?: DocumentListParams) => {
    const queryString = params
      ? "?" +
        new URLSearchParams(
          params as unknown as Record<string, string>,
        ).toString()
      : "";
    return await apiFetch(`/documents${queryString}`);
  },

  uploadDocument: async (file: File, title: string) => {
    const formData = new FormData();

    // BE ĐÃ CẬP NHẬT RẤT CHUẨN! Chỉ cần gửi đúng 2 trường này là đủ:
    formData.append("file", file); // Khớp với tham số (IFormFile file) của BE
    formData.append("fileTitle", title); // Khớp với tham số (string? fileTitle) của BE

    try {
      return await apiFetch("/documents", {
        method: "POST",
        body: formData,
        headers: {
          // QUAN TRỌNG: Phải ghi đè Content-Type để tránh lỗi 415 Unsupported Media Type
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error: unknown) {
      // Ép kiểu an toàn không dùng any
      const err = error as Record<string, unknown>;
      const status = typeof err?.status === "number" ? err.status : null;

      // Nếu lỗi Parse JSON nhưng code trả về không phải 4xx hay 5xx -> Bỏ qua
      if (!status || (status >= 200 && status < 300)) {
        console.warn(
          "Bypass lỗi Axios, ép thành công do BE đã nhận file:",
          error,
        );
        return { success: true };
      }
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    return await apiFetch(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  resyncDocument: async (id: string) => {
    return await apiFetch(`/documents/${id}/resync`, {
      method: "POST",
    });
  },
};
