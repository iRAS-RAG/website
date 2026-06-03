// src/types/document.ts
export const DocumentRagStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Indexed: "Indexed",
  Failed: "Failed",
} as const;

export type DocumentRagStatus = (typeof DocumentRagStatus)[keyof typeof DocumentRagStatus];

// SignalR sends the enum as an integer — map it back to the string variant
const RAG_STATUS_FROM_INT: Record<number, DocumentRagStatus> = {
  0: "Pending",
  1: "Processing",
  2: "Indexed",
  3: "Failed",
};

export function ragStatusFromInt(value: number): DocumentRagStatus {
  return RAG_STATUS_FROM_INT[value] ?? "Pending";
}

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
  ragStatus: DocumentRagStatus;
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
