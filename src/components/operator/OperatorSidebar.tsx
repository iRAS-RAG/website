import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import WaterIcon from "@mui/icons-material/Water";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menuItems: MenuItemType[] = [
  { text: "Bảng điều khiển", icon: <DashboardIcon />, path: "/operator/dashboard" },
  { text: "Bể nuôi", icon: <WaterIcon />, path: "/operator/tanks" },
  { text: "Cảm biến", icon: <SensorsIcon />, path: "/operator/sensors" },
  { text: "Cảnh báo", icon: <WarningIcon />, path: "/operator/alerts" },
  { text: "Tư vấn AI", icon: <PsychologyIcon />, path: "/operator/ai-advisory" },
  { text: "Nhật ký bảo trì", icon: <AssignmentIcon />, path: "/operator/maintenance" },
  { text: "Cài đặt", icon: <SettingsIcon />, path: "/operator/settings" },
];

export const OperatorSidebar = () => {
  return <Sidebar menu={menuItems} activeStyle="primary" userName={"Nguyễn Văn A"} userRole={"Kỹ thuật viên"} userInitials={"A"} zIndex={1200} />;
};

export default OperatorSidebar;
