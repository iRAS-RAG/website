import { useState, useEffect } from "react";
// Import hàm apiFetch có sẵn trong client.ts của bạn
import { apiFetch } from "../api/client";

export interface DashboardStats {
  totalTanks: number;
  totalBatches: number;
  totalSensors: number;
  totalDevices: number;
  totalMaintenance: number;
}

// KHAI BÁO CẤU TRÚC RESPONSE ĐỂ THAY THẾ CHO `any`
interface ApiMeta {
  totalItems?: number;
}

interface ApiPayload {
  meta?: ApiMeta;
  items?: unknown[];
}

type FetchResponse = ApiPayload | unknown[];

export const useOperatorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTanks: 0,
    totalBatches: 0,
    totalSensors: 0,
    totalDevices: 0,
    totalMaintenance: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Hàm helper gọi API lấy metadata (truyền page=1&pageSize=1 trực tiếp vào URL)
        // Dùng catch để nếu 1 API sập, các API khác vẫn hiển thị số bình thường
        const safeGetCount = async (url: string): Promise<number> => {
          try {
            // SỬ DỤNG FetchResponse THAY VÌ any
            const res = await apiFetch<FetchResponse>(
              `${url}?page=1&pageSize=1`,
            );

            // Xử lý trường hợp trả về là một mảng trực tiếp
            if (Array.isArray(res)) {
              return res.length;
            }

            // Xử lý trường hợp trả về là một Object có phân trang (meta / items)
            if (res && typeof res === "object") {
              if (res.meta && typeof res.meta.totalItems === "number") {
                return res.meta.totalItems;
              }
              if (res.items && Array.isArray(res.items)) {
                return res.items.length;
              }
            }

            return 0;
          } catch (err) {
            console.error(`Lỗi tải API ${url}:`, err);
            return 0;
          }
        };

        // Gọi 5 API song song để tối ưu tốc độ tải trang
        const [tanks, batches, sensors, devices, maintenance] =
          await Promise.all([
            safeGetCount("/fish-tanks"),
            safeGetCount("/batches"),
            safeGetCount("/hardwares/sensors"),
            safeGetCount("/hardwares/control-devices"),
            safeGetCount("/corrective-actions"),
          ]);

        setStats({
          totalTanks: tanks,
          totalBatches: batches,
          totalSensors: sensors,
          totalDevices: devices,
          totalMaintenance: maintenance,
        });
      } catch (error) {
        console.error("Lỗi đồng bộ thống kê Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Tự động làm mới dữ liệu sau mỗi 30 giây
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};
