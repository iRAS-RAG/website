import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PetsIcon from "@mui/icons-material/Pets";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/supervisor/dashboard" },
  { text: "Loài", icon: <PetsIcon />, path: "/supervisor/species" },
  { text: "Thức ăn", icon: <FastfoodIcon />, path: "/supervisor/feeds" },
  { text: "Ngưỡng cảm biến", icon: <NotificationsActiveIcon />, path: "/supervisor/thresholds" },
  { text: "Lịch cho ăn", icon: <ScheduleIcon />, path: "/supervisor/schedule" },
];

export const SupervisorSidebar: React.FC = () => {
  return <Sidebar menu={menu} activeStyle={"leftBorder"} userName={"Supervisor"} userRole={"Quản lý"} userInitials={"M"} />;
};

export default SupervisorSidebar;
