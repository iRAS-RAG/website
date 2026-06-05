import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";

export type DashboardStats = {
  totalEmployees: number;
  activeBatches: number;
  totalFeedTypes: number;
  totalSpecies: number;
};

// 1. Định nghĩa Interface chuẩn hỗ trợ nhiều cấu trúc trả về của .NET
interface ApiResponse {
  totalCount?: number;
  TotalCount?: number;
  totalItems?: number;
  data?:
    | {
        totalCount?: number;
        TotalCount?: number;
        items?: Record<string, unknown>[];
      }
    | Record<string, unknown>[];
  items?: Record<string, unknown>[];
  meta?: {
    totalCount?: number;
  };
  [key: string]: unknown;
}

export function useSupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeBatches: 0,
    totalFeedTypes: 0,
    totalSpecies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // NÂNG CẤP: Đặt pageSize=100 (Max của BE) để đảm bảo đếm Array.length luôn đúng nếu fallback
        const [usersRes, batchesRes, feedTypesRes, speciesRes] =
          await Promise.all([
            apiFetch<ApiResponse>("/users?page=1&pageSize=100"),
            apiFetch<ApiResponse>("/batches?Status=ACTIVE&page=1&pageSize=100"),
            apiFetch<ApiResponse>("/feed-types?page=1&pageSize=100"),
            apiFetch<ApiResponse>("/species?page=1&pageSize=100"),
          ]);

        // Hàm trích xuất tổng số thông minh, quét toàn bộ các format phổ biến
        const extractCount = (res: ApiResponse | null | undefined): number => {
          if (!res) return 0;

          // Cố gắng tìm biến lưu tổng số (TotalCount)
          const count =
            res.totalCount ??
            res.TotalCount ??
            res.totalItems ??
            (res.data as Record<string, unknown>)?.totalCount ??
            (res.data as Record<string, unknown>)?.TotalCount ??
            res.meta?.totalCount;

          if (typeof count === "number") return count;

          // FALLBACK TỐI THƯỢNG: Đếm độ dài mảng (Nhờ pageSize=100 nên vẫn đúng)
          if (Array.isArray(res.items)) return res.items.length;
          if (Array.isArray((res.data as Record<string, unknown>)?.items)) {
            return ((res.data as Record<string, unknown>).items as unknown[])
              .length;
          }
          if (Array.isArray(res.data)) return res.data.length;

          return 0;
        };

        setStats({
          totalEmployees: extractCount(usersRes),
          activeBatches: extractCount(batchesRes),
          totalFeedTypes: extractCount(feedTypesRes),
          totalSpecies: extractCount(speciesRes),
        });
      } catch (error) {
        console.error("Failed to fetch supervisor dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return { stats, loading };
}
