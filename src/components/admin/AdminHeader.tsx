import React from "react";
import DashboardHeader from "../common/DashboardHeader";

export const AdminHeader: React.FC = () => {
  return <DashboardHeader searchPlaceholder="Tìm nhanh người dùng, thiết bị..." showNotifications={false} />;
};

export default AdminHeader;
