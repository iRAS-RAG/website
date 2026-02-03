import React from "react";
import DashboardHeader from "../common/DashboardHeader";

export const OperatorHeader: React.FC = () => {
  type Notification = { type: "error" | "warning" | "success"; title: string; time: string };
  const operatorNotifications: Notification[] = [
    { type: "error", title: "Bể A-03: Ammonia vượt ngưỡng", time: "2 phút trước" },
    { type: "warning", title: "Bể B-01: Oxy hòa tan thấp", time: "15 phút trước" },
    { type: "success", title: "Bể A-01: Đã ổn định trở lại", time: "1 giờ trước" },
  ];

  return (
    <DashboardHeader
      title="Bảng điều khiển Operator"
      badgeCount={operatorNotifications.length}
      searchPlaceholder="Tìm nhanh mã bể, cảm biến..."
      notifications={operatorNotifications}
      seeAllRoute="/operator/alerts"
    />
  );
};

export default OperatorHeader;
