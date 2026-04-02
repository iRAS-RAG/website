// src/types/document.ts
export interface DocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedByUserId: string;
  uploadedByUserEmail: string;
  uploadedAt: string;
  status?: string | number; // Có thể BE sẽ trả về status nhúng AI (0: Đang nhúng, 1: Sẵn sàng, 2: Lỗi)
}

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface DocumentMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
