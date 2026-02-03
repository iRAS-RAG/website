import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PetsIcon from "@mui/icons-material/Pets";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/manager/dashboard" },
  { text: "Loài", icon: <PetsIcon />, path: "/manager/species" },
  { text: "Thức ăn", icon: <FastfoodIcon />, path: "/manager/feeds" },
  { text: "Ngưỡng cảm biến", icon: <NotificationsActiveIcon />, path: "/manager/thresholds" },
  { text: "Lịch cho ăn", icon: <ScheduleIcon />, path: "/manager/schedule" },
];

export const ManagerSidebar: React.FC = () => {
  return <Sidebar menu={menu} activeStyle={"leftBorder"} userName={"Manager"} userRole={"Quản lý"} userInitials={"M"} />;
};

export default ManagerSidebar;
