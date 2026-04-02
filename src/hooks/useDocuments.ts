// src/hooks/useDocuments.ts
import { useState, useEffect, useCallback } from "react";
import { documentApi } from "../api/documents";
import type {
  DocumentItem,
  DocumentListParams,
  DocumentMeta,
} from "../types/document";

// Định nghĩa cấu trúc trả về của API để thay thế cho 'any'
interface DocumentApiResponse {
  data?: DocumentItem[] | { items?: DocumentItem[] };
  meta?: DocumentMeta;
}

export default function useDocuments(
  initialParams: DocumentListParams = { page: 1, pageSize: 10 },
) {
  const [data, setData] = useState<DocumentItem[]>([]);
  const [meta, setMeta] = useState<DocumentMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<DocumentListParams>(initialParams);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Ép kiểu (Type Assertion) về DocumentApiResponse chuẩn xác
      const response = (await documentApi.getDocuments(
        params,
      )) as DocumentApiResponse;

      // Xử lý dữ liệu an toàn mà không bị cảnh báo
      const responseData = response?.data;
      const items = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

      setData(items);
      setMeta(response?.meta || null);
    } catch (error) {
      console.error("Lỗi lấy danh sách tài liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File, title: string) => {
    await documentApi.uploadDocument(file, title);
    await load(); // Tải lại danh sách sau khi upload
  };

  const remove = async (id: string) => {
    await documentApi.deleteDocument(id);
    await load(); // Tải lại danh sách sau khi xóa
  };

  return {
    data,
    meta,
    loading,
    params,
    setParams,
    load,
    upload,
    remove,
  };
}
