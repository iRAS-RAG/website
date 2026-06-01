// src/hooks/useAlerts.ts
import { useState, useEffect, useCallback } from "react";
import { alertApi } from "../api/alerts";
import type { IAlert } from "../types/alert";
import { isApiError, extractArray } from "../api/client";

type StatusCounts = {
  open: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  total: number;
};

type ApiResult = {
  meta?: { totalItems?: number };
  statusCounts?: StatusCounts;
};

export const useAlerts = (initialPage = 1, initialPageSize = 10, statuses?: string[]) => {
  const [data, setData] = useState<IAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quản lý phân trang
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ open: 0, acknowledged: 0, resolved: 0, dismissed: 0, total: 0 });


  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await alertApi.getAll({ page, pageSize, statuses, sortBy: "raisedat", sortDir: "desc" });

      const items = extractArray(result) as IAlert[];
      setData(items);

      const res = result as ApiResult;
      setTotalCount(res?.meta?.totalItems || items.length);
      if (res?.statusCounts) setStatusCounts(res.statusCounts);
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
  }, [page, pageSize, statuses?.join(",")]);

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
    statusCounts,
    refetch: fetchAlerts,
  };
};
