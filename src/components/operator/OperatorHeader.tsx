import React, { useEffect, useState } from "react";
import DashboardHeader from "../common/DashboardHeader";
// Sử dụng apiFetch đã được cấu hình sẵn trong project của bạn
import { apiFetch } from "../../api/client";

type NotificationType = "error" | "warning" | "success";

type Notification = {
  type: NotificationType;
  title: string;
  time: string;
};

// 1. KHAI BÁO INTERFACE CHO DỮ LIỆU CẢNH BÁO TỪ API ĐỂ XÓA LỖI 'any'
interface AlertItem {
  status: string;
  fishTankName?: string;
  sensorTypeName?: string;
  raisedAt?: string;
  createdAt?: string;
}

// 2. KHAI BÁO INTERFACE CHO RESPONSE CỦA API
interface AlertsResponse {
  data?: AlertItem[];
  items?: AlertItem[];
  meta?: {
    totalItems?: number;
  };
}

// Hàm helper để tính thời gian trôi qua (Ví dụ: "5 phút trước")
const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "Vừa xong";
  const past = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

export const OperatorHeader: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [badgeCount, setBadgeCount] = useState<number>(0);

  useEffect(() => {
    const fetchLatestAlerts = async () => {
      try {
        // Sử dụng Interface AlertsResponse thay vì <any>
        const res = await apiFetch<AlertsResponse>("/alerts?page=1&pageSize=5");

        // Bóc tách dữ liệu an toàn
        const items = res?.data || res?.items || [];
        const total = res?.meta?.totalItems || items.length || 0;

        setBadgeCount(total);

        // Sử dụng AlertItem thay vì alert: any
        const mappedNotifs: Notification[] = items.map((alert: AlertItem) => {
          let notifType: NotificationType = "error";

          // OPEN = Lỗi (Đỏ), ACKNOWLEDGED = Đang xử lý (Vàng), RESOLVED = Đã giải quyết (Xanh)
          if (alert.status === "ACKNOWLEDGED") notifType = "warning";
          else if (alert.status === "RESOLVED") notifType = "success";

          const tankName = alert.fishTankName || "Hệ thống";
          const sensorName = alert.sensorTypeName || "Cảm biến";

          return {
            type: notifType,
            title: ` ${tankName}: Cảnh báo ${sensorName}`,
            time: getTimeAgo(alert.raisedAt || alert.createdAt),
          };
        });

        setNotifications(mappedNotifs);
      } catch (error) {
        console.error("Lỗi khi tải cảnh báo trên Header:", error);
      }
    };

    fetchLatestAlerts();

    // Tự động làm mới thông báo mỗi 60 giây
    const interval = setInterval(fetchLatestAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardHeader
      // Nếu có cảnh báo chưa xử lý (OPEN), ta có thể đếm riêng,
      // ở đây tạm hiển thị tổng số cảnh báo trong DB
      badgeCount={badgeCount}
      searchPlaceholder="Tìm nhanh mã bể, cảm biến..."
      // Nếu không có cảnh báo nào, hiển thị mặc định 1 dòng thông báo tốt
      notifications={
        notifications.length > 0
          ? notifications
          : [
              {
                type: "success",
                title: "Hệ thống đang hoạt động ổn định",
                time: "Vừa xong",
              },
            ]
      }
      seeAllRoute="/operator/alerts"
    />
  );
};

export default OperatorHeader;
