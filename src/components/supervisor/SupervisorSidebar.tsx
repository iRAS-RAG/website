import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/supervisor/dashboard" },
  { text: "Thức ăn", icon: <FastfoodIcon />, path: "/supervisor/feed-types" },
  { text: "Cấu hình loài", icon: <SettingsSuggestIcon />, path: "/supervisor/species-configs" },
];

export const SupervisorSidebar: React.FC = () => {
  return <Sidebar menu={menu} activeStyle={"leftBorder"} userName={"Supervisor"} userRole={"Quản lý"} userInitials={"M"} />;
};

export default SupervisorSidebar;
