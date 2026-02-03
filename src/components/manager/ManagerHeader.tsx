import React from "react";
import DashboardHeader from "../common/DashboardHeader";

export const ManagerHeader: React.FC = () => {
  type Notification = { type: "error" | "warning" | "success"; title: string; time: string };
  const managerNotifications: Notification[] = [
    { type: "warning", title: "Lịch ăn bể B-02 bị trễ", time: "10 phút trước" },
    { type: "success", title: "Ngưỡng mới áp dụng cho loài Tilapia", time: "2 giờ trước" },
    { type: "error", title: "Cảm biến thức ăn Z lỗi", time: "3 phút trước" },
  ];

  return (
    <DashboardHeader
      title="Bảng điều khiển Manager"
      badgeCount={managerNotifications.length}
      searchPlaceholder="Tìm nhanh lịch, loài, nguồn..."
      notifications={managerNotifications}
      seeAllRoute="/manager/alerts"
    />
  );
};

export default ManagerHeader;
