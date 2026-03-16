// src/hooks/useAlerts.ts
import { useState, useEffect, useCallback } from "react";
import { alertApi } from "../api/alerts";
import type { IAlert } from "../types/alert";
import { isApiError, extractArray } from "../api/client";

export const useAlerts = (initialPage = 1, initialPageSize = 10) => {
  const [data, setData] = useState<IAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quản lý phân trang
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await alertApi.getAll({ page, pageSize });

      // Bóc tách mảng an toàn
      const items = extractArray(result) as IAlert[];
      setData(items);

      // SỬA LỖI Ở ĐÂY: Tạo Type thay vì dùng 'any'
      type ApiResultWithMeta = {
        meta?: {
          totalItems?: number;
        };
      };

      const total =
        (result as ApiResultWithMeta)?.meta?.totalItems || items.length;
      setTotalCount(total);
    } catch (err: unknown) {
      console.error("Lỗi khi tải cảnh báo:", err);
      if (isApiError(err)) {
        const errorData = err.data as { message?: string };
        setError(errorData?.message || "Lỗi từ máy chủ khi tải cảnh báo");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Lỗi không xác định khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    pageSize,
    totalCount,
    refetch: fetchAlerts,
  };
};
