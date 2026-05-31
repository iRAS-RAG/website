import React from "react";
import DashboardHeader from "../common/DashboardHeader";

export const SupervisorHeader: React.FC = () => {
  return <DashboardHeader searchPlaceholder="Tìm nhanh lịch, loài, nguồn..." showNotifications={false} />;
};

export default SupervisorHeader;
