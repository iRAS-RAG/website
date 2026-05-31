import React, { useEffect, useRef, useState } from "react";
import DashboardHeader, { type AlertPopup } from "../common/DashboardHeader";
import { apiFetch } from "../../api/client";
import { useAlertSignalR, type AlertPush } from "../../hooks/useAlertSignalR";

type NotificationType = "error" | "warning" | "success";

type Notification = {
  id?: string;
  type: NotificationType;
  title: string;
  time: string;
};

interface AlertItem {
  id?: string;
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
  const [alertPopup, setAlertPopup] = useState<AlertPopup | null>(null);
  const liveNotifsRef = useRef<Notification[]>([]);
  const popupKeyRef = useRef(0);

  useAlertSignalR({
    onReceiveAlert: (push: AlertPush) => {
      const bellTitle = `${push.tankName}: Cảnh báo ${push.sensorTypeName || "Cảm biến"}`;
      const popupTitle = `${push.tankName} — ${push.sensorTypeName || "Cảm biến"}: ${push.triggerValue} (ngưỡng ${push.minValue}–${push.maxValue})`;
      const newNotif: Notification = {
        id: push.alertId,
        type: "error",
        title: bellTitle,
        time: "Vừa xong",
      };
      liveNotifsRef.current = [newNotif, ...liveNotifsRef.current].slice(0, 5);
      setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
      setBadgeCount((prev) => prev + 1);
      popupKeyRef.current += 1;
      setAlertPopup({ key: popupKeyRef.current, type: "error", title: popupTitle });
    },
  });

  useEffect(() => {
    const fetchLatestAlerts = async () => {
      try {
        const res = await apiFetch<AlertsResponse>("/alerts?page=1&pageSize=5");

        const items = res?.data || res?.items || [];
        const total = res?.meta?.totalItems || items.length || 0;

        setBadgeCount(total);

        const fetchedNotifs: Notification[] = items.map((alert: AlertItem) => {
          let notifType: NotificationType = "error";
          if (alert.status === "ACKNOWLEDGED") notifType = "warning";
          else if (alert.status === "RESOLVED") notifType = "success";

          return {
            id: alert.id,
            type: notifType,
            title: `${alert.fishTankName || "Hệ thống"}: Cảnh báo ${alert.sensorTypeName || "Cảm biến"}`,
            time: getTimeAgo(alert.raisedAt || alert.createdAt),
          };
        });

        const liveIds = new Set(liveNotifsRef.current.map((n) => n.id).filter(Boolean));
        const merged = [
          ...liveNotifsRef.current,
          ...fetchedNotifs.filter((n) => !n.id || !liveIds.has(n.id)),
        ].slice(0, 10);

        setNotifications(merged);
      } catch (error) {
        console.error("Lỗi khi tải cảnh báo trên Header:", error);
      }
    };

    fetchLatestAlerts();

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
      alertPopup={alertPopup}
      onAlertPopupDismiss={() => setAlertPopup(null)}
    />
  );
};

export default OperatorHeader;
