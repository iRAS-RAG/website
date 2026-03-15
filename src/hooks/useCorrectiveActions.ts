import { useState, useEffect, useCallback } from "react";
import { correctiveActionApi } from "../api/correctiveActions";
import type { ICorrectiveAction } from "../types/corrective-action";
import { isApiError } from "../api/client"; // Import hàm check lỗi từ client.ts của bạn

export const useCorrectiveActions = () => {
  const [data, setData] = useState<ICorrectiveAction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await correctiveActionApi.getAll(1, 100);

      // Xử lý linh hoạt: Nếu apiFetch trả về mảng trực tiếp, hoặc trả về object { data: [...] }
      const items = Array.isArray(result) ? result : result?.data || [];

      setData(items as ICorrectiveAction[]);
      setError(null);
    } catch (err: unknown) {
      if (isApiError(err)) {
        // Ép kiểu err.data để lấy message từ Backend trả về
        const errorData = err.data as { message?: string };
        setError(
          errorData?.message || err.message || "Lỗi từ máy chủ khi tải dữ liệu",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Lỗi không xác định khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return { data, loading, error, refetch: fetchActions };
};
