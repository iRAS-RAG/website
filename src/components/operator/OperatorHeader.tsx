import React, { useEffect, useRef, useState } from "react";
import DashboardHeader, { type AlertPopup } from "../common/DashboardHeader";
import { apiFetch } from "../../api/client";
import { useAlertSignalR, type AlertPush } from "../../hooks/useAlertSignalR";
import { useNavigate } from "react-router-dom";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const liveNotifsRef = useRef<Notification[]>([]);
  const liveDeltaRef = useRef(0); // SignalR increments since last API poll
  const popupKeyRef = useRef(0);
  const navigate = useNavigate();

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
      liveDeltaRef.current += 1;
      setBadgeCount((prev) => prev + 1);
      popupKeyRef.current += 1;
      setAlertPopup({ key: popupKeyRef.current, type: "error", title: popupTitle, alertId: push.alertId });
    },
    onAlertStatusChanged: () => {
      // Alert was resolved/acknowledged/dismissed — refetch to update badge
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  useEffect(() => {
    const fetchLatestAlerts = async () => {
      try {
        const res = await apiFetch<AlertsResponse>("/alerts?page=1&pageSize=5&statuses=Open&statuses=Acknowledged");

        const items = (res?.data || res?.items || []).sort((a, b) => {
          const pa = a.status === "OPEN" || a.status === "ACKNOWLEDGED" ? 0 : 1;
          const pb = b.status === "OPEN" || b.status === "ACKNOWLEDGED" ? 0 : 1;
          if (pa !== pb) return pa - pb;
          return new Date(b.raisedAt || b.createdAt || 0).getTime() - new Date(a.raisedAt || a.createdAt || 0).getTime();
        });

        const activeCount = items.filter(
          (a) => a.status === "OPEN" || a.status === "ACKNOWLEDGED",
        ).length;

        // Preserve any SignalR increments from alerts the API might not yet reflect.
        // This prevents the badge count from dropping when a SignalR push arrived
        // but the next API poll hasn't indexed it yet.
        setBadgeCount(activeCount + liveDeltaRef.current);
        liveDeltaRef.current = 0;

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
  }, [refreshTrigger]);

  return (
    <DashboardHeader
      // Nếu có cảnh báo chưa xử lý (OPEN), ta có thể đếm riêng,
      // ở đây tạm hiển thị tổng số cảnh báo trong DB
      badgeCount={badgeCount}
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
      onAlertPopupDismiss={(alertId) => {
        setAlertPopup(null);
        if (alertId) navigate("/operator/alerts", { state: { openAlertId: alertId } });
      }}
      onNotificationClick={(id) => {
        if (id) navigate("/operator/alerts", { state: { openAlertId: id } });
      }}
    />
  );
};

export default OperatorHeader;
