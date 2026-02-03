import React from "react";
import DashboardHeader from "../common/DashboardHeader";

export const AdminHeader: React.FC = () => {
  type Notification = { type: "error" | "warning" | "success"; title: string; time: string };
  const adminNotifications: Notification[] = [
    { type: "error", title: "Người dùng X đăng ký tài khoản", time: "5 phút trước" },
    { type: "warning", title: "Thiết bị Y mất kết nối", time: "30 phút trước" },
    { type: "success", title: "Cập nhật cấu hình thành công", time: "1 giờ trước" },
  ];

  return <DashboardHeader badgeCount={adminNotifications.length} searchPlaceholder="Tìm nhanh người dùng, thiết bị..." notifications={adminNotifications} seeAllRoute="/admin/alerts" />;
};

export default AdminHeader;
