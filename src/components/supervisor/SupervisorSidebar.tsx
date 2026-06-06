import AgricultureIcon from "@mui/icons-material/Agriculture";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PeopleIcon from "@mui/icons-material/People";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { useCachedProfile } from "../../hooks/useCachedProfile";
import Sidebar, { type MenuItemType } from "../common/Sidebar";

const menu: MenuItemType[] = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/supervisor/dashboard" },
  { text: "Nhân viên", icon: <PeopleIcon />, path: "/supervisor/operators" },
  { text: "Vụ nuôi", icon: <AgricultureIcon />, path: "/supervisor/batches" },
  { text: "Cám", icon: <FastfoodIcon />, path: "/supervisor/feed-types" },
  { text: "Cấu hình loài", icon: <SettingsSuggestIcon />, path: "/supervisor/species-configs" },
];

export const SupervisorSidebar: React.FC = () => {
  const profile = useCachedProfile();

  return <Sidebar menu={menu} activeStyle="leftBorder" userName={profile?.name ?? ""} userRole={profile?.role ?? ""} userInitials={profile?.name ? profile.name.charAt(0).toUpperCase() : "U"} />;
};

export default SupervisorSidebar;
