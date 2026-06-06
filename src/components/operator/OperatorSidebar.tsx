import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SensorsIcon from "@mui/icons-material/Sensors";
// import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import WaterIcon from "@mui/icons-material/Water";
import { useCachedProfile } from "../../hooks/useCachedProfile";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menuItems: MenuItemType[] = [
  {
    text: "Tổng quan",
    icon: <DashboardIcon />,
    path: "/operator/dashboard",
  },
  { text: "Vụ nuôi", icon: <WaterIcon />, path: "/operator/tanks" },
  {
    text: "Cảm biến bể ",
    icon: <SensorsIcon />,
    path: "/operator/sensors",
  },
  { text: "Cảnh báo", icon: <WarningIcon />, path: "/operator/alerts" },
  {
    text: "Tư vấn AI",
    icon: <PsychologyIcon />,
    path: "/operator/ai-advisory",
  },
  {
    text: "Nhật ký bảo trì",
    icon: <AssignmentIcon />,
    path: "/operator/maintenance",
  },
  // { text: "Cài đặt", icon: <SettingsIcon />, path: "/operator/settings" },
];

export const OperatorSidebar = () => {
  const profile = useCachedProfile();

  return (
    <Sidebar
      menu={menuItems}
      activeStyle="leftBorder"
      userName={profile?.name ?? ""}
      userRole={profile?.role ?? ""}
      userInitials={profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
      zIndex={1200}
    />
  );
};

export default OperatorSidebar;
